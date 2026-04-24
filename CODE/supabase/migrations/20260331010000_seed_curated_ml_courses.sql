-- Seed curated ML course videos for 16 weeks (Corrected Titles)
INSERT INTO public.courses (id, title, platform, url, track, skill_covered, difficulty_level, duration_hours, is_free, rating, description, instructor, is_curated) VALUES
-- Week 1: Math Basics
(gen_random_uuid(), 'Linear Algebra Fundamentals', 'YouTube', 'http://www.youtube.com/watch?v=fNk_zzaMoSs', 'Data Science & ML', 'Linear Algebra', 'Beginner', 1, true, 5.0, 'Curated learning resource for Linear Algebra', 'Team Curated', true),
(gen_random_uuid(), 'Vectors in Machine Learning', 'YouTube', 'http://www.youtube.com/watch?v=wvW4fAFUUWE', 'Data Science & ML', 'Linear Algebra', 'Beginner', 1, true, 5.0, 'Curated learning resource for Linear Algebra', 'Team Curated', true),
(gen_random_uuid(), 'Matrices for Data Science', 'YouTube', 'http://www.youtube.com/watch?v=5oZ84mlt7tM', 'Data Science & ML', 'Matrices', 'Beginner', 1, true, 5.0, 'Curated learning resource for Matrices', 'Team Curated', true),
(gen_random_uuid(), 'Advanced Matrix Operations', 'YouTube', 'http://www.youtube.com/watch?v=ZTt9gsGcdDo', 'Data Science & ML', 'Matrices', 'Beginner', 1, true, 5.0, 'Curated learning resource for Matrices', 'Team Curated', true),
(gen_random_uuid(), 'Calculus for ML Foundations', 'YouTube', 'http://www.youtube.com/watch?v=TYLyAfFn_ME', 'Data Science & ML', 'Basic Calculus', 'Beginner', 1, true, 5.0, 'Curated learning resource for Basic Calculus', 'Team Curated', true),
(gen_random_uuid(), 'Gradient Intuition and Calculus', 'YouTube', 'http://www.youtube.com/watch?v=GkB4vW16QHI', 'Data Science & ML', 'Basic Calculus', 'Beginner', 1, true, 5.0, 'Curated learning resource for Basic Calculus', 'Team Curated', true),

-- Week 2: Statistics Core
(gen_random_uuid(), 'Introduction to Descriptive Statistics', 'YouTube', 'http://www.youtube.com/watch?v=8aB-1tTQYVU', 'Data Science & ML', 'Descriptive Statistics', 'Beginner', 1, true, 5.0, 'Curated learning resource for Descriptive Statistics', 'Team Curated', true),
(gen_random_uuid(), 'Summary Statistics & Data Visualization', 'YouTube', 'http://www.youtube.com/watch?v=27KBkGroqnU', 'Data Science & ML', 'Descriptive Statistics', 'Beginner', 1, true, 5.0, 'Curated learning resource for Descriptive Statistics', 'Team Curated', true),
(gen_random_uuid(), 'Probability Theory for ML', 'YouTube', 'http://www.youtube.com/watch?v=pYxNSUDSFH4', 'Data Science & ML', 'Probability', 'Beginner', 1, true, 5.0, 'Curated learning resource for Probability', 'Team Curated', true),
(gen_random_uuid(), 'Conditional Probability & Bayes', 'YouTube', 'http://www.youtube.com/watch?v=IsuHDFy45to', 'Data Science & ML', 'Probability', 'Beginner', 1, true, 5.0, 'Curated learning resource for Probability', 'Team Curated', true),
(gen_random_uuid(), 'Probability Distributions Overview', 'YouTube', 'http://www.youtube.com/watch?v=oI3hZJqXJuc', 'Data Science & ML', 'Distributions', 'Beginner', 1, true, 5.0, 'Curated learning resource for Distributions', 'Team Curated', true),
(gen_random_uuid(), 'Normal, Bernoulli, & Poisson Distributions', 'YouTube', 'http://www.youtube.com/watch?v=b9a27XN_6tg', 'Data Science & ML', 'Distributions', 'Beginner', 1, true, 5.0, 'Curated learning resource for Distributions', 'Team Curated', true),

-- Week 3: Hypothesis Testing
(gen_random_uuid(), 'P-Values Explained Simply', 'YouTube', 'http://www.youtube.com/watch?v=vemZtEM63GY', 'Data Science & ML', 'p-values', 'Beginner', 1, true, 5.0, 'Curated learning resource for p-values', 'Team Curated', true),
(gen_random_uuid(), 'Statistical Significance & P-Values', 'YouTube', 'http://www.youtube.com/watch?v=tdj-hoivzHQ', 'Data Science & ML', 'p-values', 'Beginner', 1, true, 5.0, 'Curated learning resource for p-values', 'Team Curated', true),
(gen_random_uuid(), 'Introduction to Confidence Intervals', 'YouTube', 'http://www.youtube.com/watch?v=TqOeMYtOc1w', 'Data Science & ML', 'Confidence Intervals', 'Beginner', 1, true, 5.0, 'Curated learning resource for Confidence Intervals', 'Team Curated', true),
(gen_random_uuid(), 'Margin of Error and Confidence Intervals', 'YouTube', 'http://www.youtube.com/watch?v=ENnlSlvQHO0', 'Data Science & ML', 'Confidence Intervals', 'Beginner', 1, true, 5.0, 'Curated learning resource for Confidence Intervals', 'Team Curated', true),
(gen_random_uuid(), 'A/B Testing for Data Scientist', 'YouTube', 'http://www.youtube.com/watch?v=DUNk4GPZ9bw', 'Data Science & ML', 'A/B Testing', 'Beginner', 1, true, 5.0, 'Curated learning resource for A/B Testing', 'Team Curated', true),
(gen_random_uuid(), 'Experiment Design and A/B Testing', 'YouTube', 'http://www.youtube.com/watch?v=fb8BSFr0isg', 'Data Science & ML', 'A/B Testing', 'Beginner', 1, true, 5.0, 'Curated learning resource for A/B Testing', 'Team Curated', true),

-- Week 4: Econometrics
(gen_random_uuid(), 'Regression Analysis Essentials', 'YouTube', 'http://www.youtube.com/watch?v=3dhcmeOTZ_Q', 'Data Science & ML', 'Regression', 'Beginner', 1, true, 5.0, 'Curated learning resource for Regression', 'Team Curated', true),
(gen_random_uuid(), 'Linear and Multiple Regression', 'YouTube', 'http://www.youtube.com/watch?v=owI7zxCqNY0', 'Data Science & ML', 'Regression', 'Beginner', 1, true, 5.0, 'Curated learning resource for Regression', 'Team Curated', true),
(gen_random_uuid(), 'Time Series Analysis & Forecasting', 'YouTube', 'http://www.youtube.com/watch?v=GE3JOFwTWVM', 'Data Science & ML', 'Time Series & Forecasting', 'Intermediate', 1, true, 5.0, 'Curated learning resource for Time Series & Forecasting', 'Team Curated', true),
(gen_random_uuid(), 'ARIMA and Seasonal Forecasting', 'YouTube', 'http://www.youtube.com/watch?v=oY-j2Wof51c', 'Data Science & ML', 'Time Series & Forecasting', 'Intermediate', 1, true, 5.0, 'Curated learning resource for Time Series & Forecasting', 'Team Curated', true),
(gen_random_uuid(), 'Forecasting with Machine Learning', 'YouTube', 'http://www.youtube.com/watch?v=_ZQ-lQrK9Rg', 'Data Science & ML', 'Forecasting with ML', 'Intermediate', 1, true, 5.0, 'Curated learning resource for Forecasting with ML', 'Team Curated', true),
(gen_random_uuid(), 'Deep Learning for Forecasting', 'YouTube', 'http://www.youtube.com/watch?v=-_2wOrEuFaM', 'Data Science & ML', 'Forecasting with ML', 'Intermediate', 1, true, 5.0, 'Curated learning resource for Forecasting with ML', 'Team Curated', true),

-- Week 5: Python Basics
(gen_random_uuid(), 'Python for ML: Loops & Functions', 'YouTube', 'https://www.youtube.com/watch?v=kqtD5dpn9C8', 'Data Science & ML', 'Python Basics (Loops & Functions)', 'Beginner', 2, true, 5.0, 'Curated learning resource for Python Basics', 'Team Curated', true),
(gen_random_uuid(), 'NumPy Tutorial for Data Science', 'YouTube', 'https://www.youtube.com/watch?v=QUT1VHiLmmI', 'Data Science & ML', 'NumPy (The Math Engine)', 'Beginner', 1, true, 5.0, 'Curated learning resource for NumPy', 'Team Curated', true),
(gen_random_uuid(), 'Mastering NumPy Arrays', 'YouTube', 'https://www.youtube.com/watch?v=dcqPhpLi7NY', 'Data Science & ML', 'NumPy (The Math Engine)', 'Beginner', 1, true, 5.0, 'Curated learning resource for NumPy', 'Team Curated', true),

-- Week 6: DSA + SQL
(gen_random_uuid(), 'Data Structures for ML: Arrays', 'YouTube', 'http://www.youtube.com/watch?v=O9v10jQkm5c', 'Data Science & ML', 'Arrays & Sorting (DSA)', 'Beginner', 1, true, 5.0, 'Curated learning resource for Arrays & Sorting', 'Team Curated', true),
(gen_random_uuid(), 'Sorting Algorithms and Efficiency', 'YouTube', 'https://www.youtube.com/watch?v=gcRUIO-8r3U', 'Data Science & ML', 'Arrays & Sorting (DSA)', 'Beginner', 1, true, 5.0, 'Curated learning resource for Arrays & Sorting', 'Team Curated', true),
(gen_random_uuid(), 'SQL Basics for Data Analytics', 'YouTube', 'http://www.youtube.com/watch?v=O10Du9zWZxY', 'Data Science & ML', 'SQL Basics & Joins', 'Beginner', 1, true, 5.0, 'Curated learning resource for SQL Basics & Joins', 'Team Curated', true),
(gen_random_uuid(), 'SQL Joins Masterclass', 'YouTube', 'http://www.youtube.com/watch?v=gwp3dJUsy5g', 'Data Science & ML', 'SQL Basics & Joins', 'Beginner', 1, true, 5.0, 'Curated learning resource for SQL Basics & Joins', 'Team Curated', true),

-- Week 7: EDA
(gen_random_uuid(), 'Exploratory Data Analysis (EDA)', 'YouTube', 'http://www.youtube.com/watch?v=fHFOANOHwh8', 'Data Science & ML', 'Data Cleaning & EDA', 'Intermediate', 1, true, 5.0, 'Curated learning resource for Data Cleaning & EDA', 'Team Curated', true),
(gen_random_uuid(), 'Data Cleaning and Preprocessing', 'YouTube', 'http://www.youtube.com/watch?v=pkYtQjHhi3Q', 'Data Science & ML', 'Data Cleaning & EDA', 'Intermediate', 1, true, 5.0, 'Curated learning resource for Data Cleaning & EDA', 'Team Curated', true),
(gen_random_uuid(), 'Data Visualization with Matplotlib', 'YouTube', 'http://www.youtube.com/watch?v=rJnlBhruwYM', 'Data Science & ML', 'Visualization (Matplotlib & Seaborn)', 'Beginner', 1, true, 5.0, 'Curated learning resource for Visualization', 'Team Curated', true),
(gen_random_uuid(), 'Statistical Plotting with Seaborn', 'YouTube', 'http://www.youtube.com/watch?v=B2MxKz-WwA8', 'Data Science & ML', 'Visualization (Matplotlib & Seaborn)', 'Beginner', 1, true, 5.0, 'Curated learning resource for Visualization', 'Team Curated', true),

-- Week 8: ML Basics
(gen_random_uuid(), 'Supervised vs Unsupervised Concepts', 'YouTube', 'http://www.youtube.com/watch?v=W01tIRP_Rqs', 'Data Science & ML', 'Supervised vs. Unsupervised Learning', 'Beginner', 1, true, 5.0, 'Curated learning resource for ML Basics', 'Team Curated', true),
(gen_random_uuid(), 'Classification and Clustering Intro', 'YouTube', 'http://www.youtube.com/watch?v=E0Hmnixke2g', 'Data Science & ML', 'Supervised vs. Unsupervised Learning', 'Beginner', 1, true, 5.0, 'Curated learning resource for ML Basics', 'Team Curated', true),
(gen_random_uuid(), 'Overfitting: The Bias-Variance Tradeoff', 'YouTube', 'http://www.youtube.com/watch?v=EuBBz3bI-aA', 'Data Science & ML', 'Overfitting (Bias and Variance)', 'Intermediate', 1, true, 5.0, 'Curated learning resource for Overfitting', 'Team Curated', true),
(gen_random_uuid(), 'Regularization to Prevent Overfitting', 'YouTube', 'http://www.youtube.com/watch?v=o3DztvnfAJg', 'Data Science & ML', 'Overfitting (Bias and Variance)', 'Intermediate', 1, true, 5.0, 'Curated learning resource for Overfitting', 'Team Curated', true),
(gen_random_uuid(), 'Building an End-to-End ML Pipeline', 'YouTube', 'http://www.youtube.com/watch?v=LezU1WTvEzo', 'Data Science & ML', 'The ML Pipeline', 'Intermediate', 1, true, 5.0, 'Curated learning resource for The ML Pipeline', 'Team Curated', true),
(gen_random_uuid(), 'Automating Machine Learning Pipelines', 'YouTube', 'http://www.youtube.com/watch?v=O-qONAxkvK0', 'Data Science & ML', 'The ML Pipeline', 'Intermediate', 1, true, 5.0, 'Curated learning resource for The ML Pipeline', 'Team Curated', true),

-- Week 9: Regression
(gen_random_uuid(), 'Linear Regression: The Core Model', 'YouTube', 'https://www.youtube.com/watch?v=7ArmBVF2dCs', 'Data Science & ML', 'Linear Regression (The Core Model)', 'Beginner', 1, true, 5.0, 'Curated learning resource for Linear Regression', 'Team Curated', true),
(gen_random_uuid(), 'Math Intuition Behind Linear Regression', 'YouTube', 'https://www.youtube.com/watch?v=CtsRRUddV2s', 'Data Science & ML', 'Linear Regression (The Core Model)', 'Beginner', 1, true, 5.0, 'Curated learning resource for Linear Regression', 'Team Curated', true),
(gen_random_uuid(), 'Model Evaluation: MAE vs RMSE', 'YouTube', 'https://www.youtube.com/watch?v=l0yfMiCXs4c', 'Data Science & ML', 'MAE vs. RMSE (Evaluation Metrics)', 'Intermediate', 1, true, 5.0, 'Curated learning resource for Evaluation Metrics', 'Team Curated', true),
(gen_random_uuid(), 'Calculating Regression Metrics', 'YouTube', 'http://www.youtube.com/watch?v=ivPEfKzguy0', 'Data Science & ML', 'MAE vs. RMSE (Evaluation Metrics)', 'Intermediate', 1, true, 5.0, 'Curated learning resource for Evaluation Metrics', 'Team Curated', true),

-- Week 10: Classification
(gen_random_uuid(), 'Logistic Regression for Classification', 'YouTube', 'http://www.youtube.com/watch?v=yIYKR4sgzI8', 'Data Science & ML', 'Logistic Regression', 'Beginner', 1, true, 5.0, 'Curated learning resource for Logistic Regression', 'Team Curated', true),
(gen_random_uuid(), 'Sigmoid Function and Logistic Math', 'YouTube', 'http://www.youtube.com/watch?v=3bvM3NyMiE0', 'Data Science & ML', 'Logistic Regression', 'Beginner', 1, true, 5.0, 'Curated learning resource for Logistic Regression', 'Team Curated', true),
(gen_random_uuid(), 'Decision Trees Intuition', 'YouTube', 'http://www.youtube.com/watch?v=ZVR2Way4nwQ', 'Data Science & ML', 'Decision Trees', 'Intermediate', 1, true, 5.0, 'Curated learning resource for Decision Trees', 'Team Curated', true),
(gen_random_uuid(), 'Information Gain and Entropy', 'YouTube', 'http://www.youtube.com/watch?v=JcI5E2Ng6r4', 'Data Science & ML', 'Decision Trees', 'Intermediate', 1, true, 5.0, 'Curated learning resource for Decision Trees', 'Team Curated', true),
(gen_random_uuid(), 'KNN: K-Nearest Neighbors Algorithm', 'YouTube', 'http://www.youtube.com/watch?v=gs9E7E0qOIc', 'Data Science & ML', 'KNN (K-Nearest Neighbors)', 'Beginner', 1, true, 5.0, 'Curated learning resource for KNN', 'Team Curated', true),
(gen_random_uuid(), 'Choosing the Right K in KNN', 'YouTube', 'http://www.youtube.com/watch?v0p0o5cmgLdE', 'Data Science & ML', 'KNN (K-Nearest Neighbors)', 'Beginner', 1, true, 5.0, 'Curated learning resource for KNN', 'Team Curated', true),

-- Week 11: Advanced ML
(gen_random_uuid(), 'Random Forest Algorithm Explained', 'YouTube', 'http://www.youtube.com/watch?v=v6VJ2RO66Ag', 'Data Science & ML', 'Random Forest', 'Intermediate', 1, true, 5.0, 'Curated learning resource for Random Forest', 'Team Curated', true),
(gen_random_uuid(), 'Bagging and Feature Randomness', 'YouTube', 'http://www.youtube.com/watch?v=gkXX4h3qYm4', 'Data Science & ML', 'Random Forest', 'Intermediate', 1, true, 5.0, 'Curated learning resource for Random Forest', 'Team Curated', true),
(gen_random_uuid(), 'Ensemble Learning: Boosting and Bagging', 'YouTube', 'http://www.youtube.com/watch?v=sN5ZcJLDMaE', 'Data Science & ML', 'Ensemble Learning', 'Advanced', 1, true, 5.0, 'Curated learning resource for Ensemble Learning', 'Team Curated', true),
(gen_random_uuid(), 'XGBoost and Gradient Boosting', 'YouTube', 'http://www.youtube.com/watch?v=tjy0yL1rRRU', 'Data Science & ML', 'Ensemble Learning', 'Advanced', 1, true, 5.0, 'Curated learning resource for Ensemble Learning', 'Team Curated', true),
(gen_random_uuid(), 'Introduction to Neural Networks', 'YouTube', 'http://www.youtube.com/watch?v=aircAruvnKk', 'Data Science & ML', 'Neural Networks Intro', 'Intermediate', 1, true, 5.0, 'Curated learning resource for Neural Networks', 'Team Curated', true),
(gen_random_uuid(), 'Perceptrons and Deep Learning Basics', 'YouTube', 'http://www.youtube.com/watch?v=CqOfi41LfDw', 'Data Science & ML', 'Neural Networks Intro', 'Intermediate', 1, true, 5.0, 'Curated learning resource for Neural Networks', 'Team Curated', true),

-- Week 12: Neural Networks
(gen_random_uuid(), 'Artificial Neural Networks (ANN) Architecture', 'YouTube', 'http://www.youtube.com/watch?v=jmmW0F0biz0', 'Data Science & ML', 'Artificial Neural Networks (ANN)', 'Intermediate', 1, true, 5.0, 'Curated learning resource for ANN', 'Team Curated', true),
(gen_random_uuid(), 'Multi-Layer Perceptrons Explained', 'YouTube', 'http://www.youtube.com/watch?v=aircAruvnKk', 'Data Science & ML', 'Artificial Neural Networks (ANN)', 'Intermediate', 1, true, 5.0, 'Curated learning resource for ANN', 'Team Curated', true),
(gen_random_uuid(), 'Activation Functions: ReLU, Sigmoid, Tanh', 'YouTube', 'http://www.youtube.com/watch?v=s-V7gKrsels', 'Data Science & ML', 'Activation Functions', 'Intermediate', 1, true, 5.0, 'Curated learning resource for Activation Functions', 'Team Curated', true),
(gen_random_uuid(), 'Softmax and Loss Functions', 'YouTube', 'http://www.youtube.com/watch?v=Fu273ovPBmQ', 'Data Science & ML', 'Activation Functions', 'Intermediate', 1, true, 5.0, 'Curated learning resource for Activation Functions', 'Team Curated', true),
(gen_random_uuid(), 'Backpropagation Algorithm Step-by-Step', 'YouTube', 'http://www.youtube.com/watch?v=Ilg3gGewQ5U', 'Data Science & ML', 'Backpropagation', 'Advanced', 1, true, 5.0, 'Curated learning resource for Backpropagation', 'Team Curated', true),
(gen_random_uuid(), 'Optimization and Gradient Descent', 'YouTube', 'http://www.youtube.com/watch?v=IN2XmBhILt4', 'Data Science & ML', 'Backpropagation', 'Advanced', 1, true, 5.0, 'Curated learning resource for Backpropagation', 'Team Curated', true),

-- Week 13: Advanced DL
(gen_random_uuid(), 'CNN for Computer Vision', 'YouTube', 'http://www.youtube.com/watch?v=QzY57FaENXg', 'Data Science & ML', 'CNN (Convolutional Neural Networks)', 'Advanced', 1, true, 5.0, 'Curated learning resource for CNN', 'Team Curated', true),
(gen_random_uuid(), 'Max Pooling and Convolution Layers', 'YouTube', 'http://www.youtube.com/watch?v=pj9-rr1wDhM', 'Data Science & ML', 'CNN (Convolutional Neural Networks)', 'Advanced', 1, true, 5.0, 'Curated learning resource for CNN', 'Team Curated', true),
(gen_random_uuid(), 'RNN for Sequence Data', 'YouTube', 'http://www.youtube.com/watch?v=AsNTP8Kwu80', 'Data Science & ML', 'RNN (Recurrent Neural Networks)', 'Advanced', 1, true, 5.0, 'Curated learning resource for RNN', 'Team Curated', true),
(gen_random_uuid(), 'LSTMs and Gated Recurrent Units', 'YouTube', 'http://www.youtube.com/watch?v=LHXXI4-IEns', 'Data Science & ML', 'RNN (Recurrent Neural Networks)', 'Advanced', 1, true, 5.0, 'Curated learning resource for RNN', 'Team Curated', true),
(gen_random_uuid(), 'Transformers and Self-Attention', 'YouTube', 'http://www.youtube.com/watch?v=eMlx5fFNoYc', 'Data Science & ML', 'Transformers', 'Advanced', 1, true, 5.0, 'Curated learning resource for Transformers', 'Team Curated', true),
(gen_random_uuid(), 'The Transformer Revolution in AI', 'YouTube', 'http://www.youtube.com/watch?v=avjX3QrYkls', 'Data Science & ML', 'Transformers', 'Advanced', 1, true, 5.0, 'Curated learning resource for Transformers', 'Team Curated', true),

-- Week 14: MLOps
(gen_random_uuid(), 'ML Deployment and APIs', 'YouTube', 'http://www.youtube.com/watch?v=4pkzY95Otm4', 'Data Science & ML', 'Deployment & APIs', 'Intermediate', 1, true, 5.0, 'Curated learning resource for MLOps', 'Team Curated', true),
(gen_random_uuid(), 'Serving Models with Flask and FastAPI', 'YouTube', 'http://www.youtube.com/watch?v=hqVeBtp7J_E', 'Data Science & ML', 'Deployment & APIs', 'Intermediate', 1, true, 5.0, 'Curated learning resource for MLOps', 'Team Curated', true),
(gen_random_uuid(), 'CI/CD Pipelines for Machine Learning', 'YouTube', 'http://www.youtube.com/watch?v=Qvfe5YbnIvE', 'Data Science & ML', 'CI/CD for Machine Learning', 'Advanced', 1, true, 5.0, 'Curated learning resource for MLOps', 'Team Curated', true),
(gen_random_uuid(), 'Model Versioning and Monitoring', 'YouTube', 'http://www.youtube.com/watch?v=skr08dnWXC8', 'Data Science & ML', 'CI/CD for Machine Learning', 'Advanced', 1, true, 5.0, 'Curated learning resource for MLOps', 'Team Curated', true),

-- Week 15: Projects
(gen_random_uuid(), 'End-to-End Machine Learning Project', 'YouTube', 'http://www.youtube.com/watch?v=rQo1vkCe8OE', 'Data Science & ML', 'Machine Learning Projects (End-to-End)', 'Advanced', 2, true, 5.0, 'Curated project guide', 'Team Curated', true),
(gen_random_uuid(), 'Scalable ML System Design', 'YouTube', 'http://www.youtube.com/watch?v=Rv6UFGNmNZg', 'Data Science & ML', 'Machine Learning Projects (End-to-End)', 'Advanced', 2, true, 5.0, 'Curated project guide', 'Team Curated', true),
(gen_random_uuid(), 'Data Analysis Case Study: EDA', 'YouTube', 'http://www.youtube.com/watch?v=KgCgpCIOkIs', 'Data Science & ML', 'Data Analysis Projects (EDA)', 'Intermediate', 2, true, 5.0, 'Curated project guide', 'Team Curated', true),
(gen_random_uuid(), 'Advanced Data Exploration Techniques', 'YouTube', 'http://www.youtube.com/watch?v=xi0vhXFPegw', 'Data Science & ML', 'Data Analysis Projects (EDA)', 'Intermediate', 2, true, 5.0, 'Curated project guide', 'Team Curated', true),
(gen_random_uuid(), 'Project Strategy and Portfolio Insights', 'YouTube', 'http://www.youtube.com/watch?v=Bx4BYXOE9SQ', 'Data Science & ML', 'Project Strategy & Insights', 'Intermediate', 1, true, 5.0, 'Curated project guide', 'Team Curated', true),
(gen_random_uuid(), 'How to Present ML Projects', 'YouTube', 'http://www.youtube.com/watch?v=csRFfm-BwE0', 'Data Science & ML', 'Project Strategy & Insights', 'Intermediate', 1, true, 5.0, 'Curated project guide', 'Team Curated', true),

-- Week 16: Final Integration
(gen_random_uuid(), 'Job-Ready Portfolio Presentation', 'YouTube', 'http://www.youtube.com/watch?v=rQo1vkCe8OE', 'Data Science & ML', 'Portfolio (Job-Ready Presentation)', 'Advanced', 1, true, 5.0, 'Final preparation guide', 'Team Curated', true),
(gen_random_uuid(), 'Resume Building for ML Roles', 'YouTube', 'https://www.google.com/search?q=http://www.youtube.com/watch%3Fv%3DlqubRp-olw', 'Data Science & ML', 'Portfolio (Job-Ready Presentation)', 'Advanced', 1, true, 5.0, 'Final preparation guide', 'Team Curated', true),
(gen_random_uuid(), 'Hyperparameter Tuning Strategies', 'YouTube', 'http://www.youtube.com/watch?v=lfiw2Rh2v8k', 'Data Science & ML', 'Optimization (Hyperparameter Tuning)', 'Advanced', 1, true, 5.0, 'Final preparation guide', 'Team Curated', true),
(gen_random_uuid(), 'Bayesian Optimization and Grid Search', 'YouTube', 'http://www.youtube.com/watch?v=M-NTkxfd7-8', 'Data Science & ML', 'Optimization (Hyperparameter Tuning)', 'Advanced', 1, true, 5.0, 'Final preparation guide', 'Team Curated', true),
(gen_random_uuid(), 'AWS and Cloud Deployment for ML', 'YouTube', 'http://www.youtube.com/watch?v=_rwNTY5Mn40', 'Data Science & ML', 'Deployment (Cloud Services)', 'Advanced', 1, true, 5.0, 'Final preparation guide', 'Team Curated', true),
(gen_random_uuid(), 'Scaling ML models in Production', 'YouTube', 'http://www.youtube.com/watch?v=C25vrjw5Nu4', 'Data Science & ML', 'Deployment (Cloud Services)', 'Advanced', 1, true, 5.0, 'Final preparation guide', 'Team Curated', true)
ON CONFLICT (id) DO NOTHING;
