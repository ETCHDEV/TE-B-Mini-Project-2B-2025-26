from google.cloud import storage

client = storage.Client()
bucket = client.bucket("surveyai-assets-dataprepx")

blob = bucket.blob("surveyai/uploads/test.txt")
blob.upload_from_string("Hello GCP")

print("Uploaded successfully!")