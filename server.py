from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()

class ProductRequest(BaseModel):
    url: str

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)
import google.generativeai as genai
import json
genai.configure(api_key='AIzaSyB3-kv7Hzn0ky3h62pe_b6gS3bnANTOzW8')
model = genai.GenerativeModel('gemini-pro')

# @app.get("/data")
# async def product_data(request: ProductRequest):
#     return "data"

@app.post("/get-product-data")
async def get_product_data(request: ProductRequest):
    url = request.url
    response = model.generate_content("give all reviews of customers in title and description wise one by one least 15 for url = {url}")

    result = response.candidates[0].content.parts[0].text
    # print(result)
    import json

    # print(result)
    revie = []
    lines = result.strip().split("\n")

    # print(lines)

    title = description = ""

    for line in lines:
        if line.startswith("**Title:**"):
            title = line.replace("**Title:**", "").strip()
        elif line.startswith("**Description:**"):
            description = line.replace("**Description:**", "").strip()
            if title or description:
                revie.append({"title": title, "description": description})
                title = description = ""  # Reset for the next review

    reviews_json = json.dumps(revie, indent=4)
    print(reviews_json)
    reviews = json.loads(reviews_json)
    print(len(reviews))

    return {
        "title": "REVIEWS",
        "reviews": reviews
    }

