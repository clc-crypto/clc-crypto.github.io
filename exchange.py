from flask import Flask, request
import requests, json
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

with open("exchange.json", "r") as f:
  bals: dict[str, float] = json.load(f)

with open("used.json", "r") as f:
  used: list[int] = json.load(f)

def save():
  with open("exchange.json", "w") as f:
    json.dump(bals, f, indent=2)
  with open("used.json", "w") as f:
    json.dump(used, f, indent=2)

@app.route('/exchange')
def home():
  id = int(request.args.get('id', ''))
  addr = request.args.get('addr', '')
  if not addr or not id:
    return {'message': 'fail'}
  c = requests.get(f"https://master.centrix.fi/coin/{id}").json()["coin"]
  if c["transactions"][-1]["holder"] == "0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000":
    if id in used:
      return {'message': 'fail'}
    used.append(id)
    save()
    if bals.get(addr):
      bals[addr] += c["val"]
    else:
      bals[addr] = c["val"]
    save()
    return {'message': 'success'}
  return {'message': 'fail'}
  
if __name__ == '__main__':
  app.run(debug=True, port=5050)