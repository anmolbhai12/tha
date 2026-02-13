import requests
import os

def download_thakur():
    url = "https://img.freepik.com/premium-photo/mighty-sikh-warrior-traditional-attire-holding-sword_917631-155.jpg"
    target_dir = "public/assets"
    
    if not os.path.exists(target_dir):
        os.makedirs(target_dir)
        
    target_path = os.path.join(target_dir, "thakur.png")
    
    print(f"Downloading Legendary Character to {target_path}...")
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            with open(target_path, 'wb') as f:
                f.write(response.content)
            print("Successfully downloaded the Masterpiece! 🧔🏽‍♂️🕌🛡️")
        else:
            print(f"Failed to download. Status code: {response.status_code}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    download_thakur()
