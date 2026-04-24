-- Create function to get assessment questions by track with proper segregation
-- This function will replace the hardcoded question banks with database-driven approach

CREATE OR REPLACE FUNCTION public.get_assessment_questions_by_track(
  track_name text,
  num_questions integer DEFAULT 15
)
RETURNS TABLE (
  id uuid,
  category text,
  topic text,
  type text,
  question text,
  options text[],
  correct_answer text,
  explanation text,
  difficulty text,
  points integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  -- Arrays questions (6 questions)
  arrays_questions TEXT[] := ARRAY[
    '{"id": "prog-dsa-1", "type": "mcq", "question": "arr = [1,2,3,4]\nprint(arr[2])", "options": ["1", "2", "3", "4"], "correctAnswer": 2, "topic": "Arrays", "explanation": "Arrays are zero-indexed, so arr[2] accesses the third element.", "difficulty": "Easy"}',
    '{"id": "prog-dsa-2", "type": "coding", "question": "def append_and_length():\n    arr = [1,2,3]\n    arr.append(4)\n    return len(arr)\n\n# Test the function\nresult = append_and_length()\nprint(result)", "options": null, "correctAnswer": "4", "topic": "Arrays", "explanation": "The append() method adds an element to the array, making the length 4.", "difficulty": "Easy"}',
    '{"id": "prog-dsa-3", "type": "mcq", "question": "arr = [4,1,3]\narr.sort()\nprint(arr)", "options": ["[1,3,4]", "[1,4,3]", "[3,1,4]", "[4,3,1]"], "correctAnswer": 0, "topic": "Arrays", "explanation": "The sort() method arranges elements in ascending order by default.", "difficulty": "Medium"}',
    '{"id": "prog-dsa-4", "type": "mcq", "question": "arr = [1,2,3,4]\nprint(arr[::-1])", "options": ["[1,2,3,4]", "[4,3,2,1]", "[3,1,2,3]", "[1,2,3,4]"], "correctAnswer": 1, "topic": "Arrays", "explanation": "The [::-1] slice reverses the array, creating [4,3,2,1].", "difficulty": "Medium"}',
    '{"id": "prog-dsa-5", "type": "coding", "question": "def multiply_elements():\n    arr = [4,1,3]\n    for i in range(len(arr)):\n        arr[i] *= 2\n    return arr\n\n# Test the function\nresult = multiply_elements()\nprint(result)", "options": null, "correctAnswer": "[8,2,6]", "topic": "Arrays", "explanation": "Each element is multiplied by 2: 4×2=8, 1×2=2, 3×2=6.", "difficulty": "Medium"}',
    '{"id": "prog-dsa-6", "type": "coding", "question": "def modify_2d_array():\n    arr = [[0]*3]*3\n    arr[0][1] = 5\n    return arr\n\n# Test the function\nresult = modify_2d_array()\nprint(result)", "options": null, "correctAnswer": "[[0,5,0],[0,5,0],[0,5,0]]", "topic": "Arrays", "explanation": "arr[0][1] = 5 modifies the element at row 0, column 1 to 5.", "difficulty": "Hard"}'
  ];
  
  -- Strings questions (2 questions)
  strings_questions TEXT[] := ARRAY[
    '{"id": "prog-dsa-7", "type": "mcq", "question": "print(\"data\"[1])", "options": ["d", "a", "t", "IndexError"], "correctAnswer": 0, "topic": "Strings", "explanation": "String indexing starts from 0, so [1] accesses the second character \"a\".", "difficulty": "Easy"}',
    '{"id": "prog-dsa-8", "type": "coding", "question": "def count_unique_chars():\n    s = \"mississippi\"\n    return len(set(s))\n\n# Test the function\nresult = count_unique_chars()\nprint(result)", "options": null, "correctAnswer": "4", "topic": "Strings", "explanation": "The set() function removes duplicates, leaving only unique characters: m, i, s, p.", "difficulty": "Hard"}'
  ];
  
  -- Searching questions (2 questions)
  searching_questions TEXT[] := ARRAY[
    '{"id": "prog-dsa-12", "type": "mcq", "question": "arr=[1,3,5,7]\nprint(5 in arr)", "options": ["True", "False", "Error", "None"], "correctAnswer": 0, "topic": "Searching", "explanation": "The \"in\" operator checks if 5 exists in the array [1,3,5,7], which is True.", "difficulty": "Easy"}',
    '{"id": "prog-dsa-13", "type": "mcq", "question": "arr=[1,2,3,4,5,7]\nprint(arr.index(7))", "options": ["4", "5", "6", "7"], "correctAnswer": 1, "topic": "Searching", "explanation": "The index() method returns the position of the element 7, which is index 4 (0-based).", "difficulty": "Medium"}'
  ];
  
  -- Data Structures questions (2 questions)
  data_structures_questions TEXT[] := ARRAY[
    '{"id": "prog-dsa-16", "type": "mcq", "question": "Which data structure follows LIFO principle?", "options": ["Queue", "Stack", "Array", "Linked List"], "correctAnswer": 1, "topic": "Data Structures", "explanation": "Stack (Last-In-First-Out) follows LIFO principle.", "difficulty": "Easy"}',
    '{"id": "prog-dsa-17", "type": "coding", "question": "class Node:\n    def __init__(self, val):\n        self.val = val\n        self.next = None\n\nclass LinkedList:\n    def __init__(self):\n        self.head = None\n\n# Add a node to the linked list\nll = LinkedList()\nnode = Node(5)\nll.head = node", "options": null, "correctAnswer": "Linked list with head pointing to node with value 5", "topic": "Data Structures", "explanation": "Linked list implementation with node insertion.", "difficulty": "Easy"}'
  ];
  
  -- All questions combined
  all_questions TEXT[] := arrays_questions || strings_questions || searching_questions || data_structures_questions;
  
  -- Select questions based on track
  selected_questions TEXT[];
  
BEGIN
  IF track_name = 'Programming & DSA' THEN
    selected_questions := all_questions;
  ELSIF track_name = 'Data Science & ML' THEN
    -- Add Data Science questions here when needed
    selected_questions := ARRAY['{}']; -- Placeholder
  ELSIF track_name = 'Database & SQL' THEN
    -- Add Database questions here when needed
    selected_questions := ARRAY['{}']; -- Placeholder
  ELSIF track_name = 'Backend / Web Dev' THEN
    -- Add Backend questions here when needed
    selected_questions := ARRAY['{}']; -- Placeholder
  ELSE
    selected_questions := ARRAY['{}'];
  END IF;
  
  -- Convert to JSON and return required number of questions
  RETURN QUERY
    SELECT 
      gen_random_uuid() as id,
      q_data::json->>'topic' as category,
      q_data::json->>'topic' as topic,
      q_data::json->>'type' as type,
      q_data::json->>'question' as question,
      q_data::json->>'options' as options,
      q_data::json->>'correctAnswer' as correct_answer,
      q_data::json->>'explanation' as explanation,
      q_data::json->>'difficulty' as difficulty,
      1 as points
    FROM unnest(selected_questions) AS q_data
    ORDER BY random()
    LIMIT num_questions;
END;
$$;
