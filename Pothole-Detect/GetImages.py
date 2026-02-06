import os,requests
from ddgs import DDGS
# Automation script to scrape images from web

def GetImage(name : str, n : int):    
    with DDGS() as ddgs:
        results = ddgs.images(name,safesearch="off",max_results=n) # Search Results

        os.makedirs("Images", exist_ok=True) # Making directory for images
        os.chdir("Images")

    for num,result in enumerate(results):
        try: 
            img_bytes= requests.get(result["image"],timeout=(10,5)).content # Image Downloading (Raw Bytes)
            with open(f"{name}{num+1}.jpg","wb") as img:
                img.write(img_bytes) # Saving the image
        except requests.exceptions.ReadTimeout:
            print(f"[Read Error] Skipped Image {num+1}")
            continue

    print("Sucessfully Downloaded")
    
GetImage("Potholes 2.0",100)
