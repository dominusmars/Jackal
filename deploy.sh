#!/bin/bash
JACKAL="$(pwd)/server"
MONITOR="$(pwd)/monitor"


echo "Building and deploying Jackal"

cd "$JACKAL" || exit

echo "Building Jackal"
npm install
npm run build

echo "Deploying Jackal"
pm2 delete jackal
pm2 start npm --name "jackal" -- start

echo "Building and deploying Monitor"

cd "$MONITOR" || exit

echo "Building Monitor"
python3 -m venv venv
source ./venv/bin/activate
pip install -r requirements.txt

python app.py

