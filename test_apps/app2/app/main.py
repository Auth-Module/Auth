from typing import Union

from fastapi import FastAPI

app = FastAPI()


@app.get("/")
def read_root():
    return {"Lang":"Python" , "message": "Home"}

@app.get("/info")
def read_info():
    return {"Lang":"Python" , "message": "Info"}