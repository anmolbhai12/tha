import requests
import json

URL = 'https://dalaalstreetss.alwaysdata.net/properties'

def test_upload():
    print(f"Testing upload to {URL}...")
    
    # Prepare data
    data = {
        'title': 'Test Property',
        'location': 'Test Location',
        'price': 100,
        'mobile': '9999999999',
        'seller': 'Tester'
    }
    
    # Prepare files
    # form-data field for file is 'media' (from upload.array('media'))
    files = {
        'media': ('test_video.mp4', open('test_video.mp4', 'rb'), 'video/mp4')
    }
    
    try:
        # Send multipart request
        # Note: requests handles boundary automatically
        # We need to send 'data' as a field if the server expects it parsed from body.data
        # OR send individual fields.
        # Server code:
        # let propertyData = req.body;
        # if (req.body.data) propertyData = JSON.parse(req.body.data);
        
        # So we can send fields directly in 'data' param of requests
        response = requests.post(URL, data=data, files=files)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_upload()
