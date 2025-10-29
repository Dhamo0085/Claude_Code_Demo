#!/bin/bash

echo "🧪 Testing Backend Connection"
echo "=============================="
echo ""

# Test 1: Health Check
echo "1️⃣  Testing health endpoint..."
HEALTH=$(curl -s http://localhost:3000/health 2>&1)
if [[ $HEALTH == *"healthy"* ]]; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend not responding"
    echo "   Run: cd backend && npm start"
    exit 1
fi
echo ""

# Test 2: Get Pilots
echo "2️⃣  Testing pilots API..."
PILOTS=$(curl -s http://localhost:3000/api/pilots 2>&1)
if [[ $PILOTS == *"success"* ]]; then
    COUNT=$(echo $PILOTS | grep -o '"count":[0-9]*' | grep -o '[0-9]*')
    echo "✅ API working - Found $COUNT pilots"
else
    echo "❌ Pilots API failed"
    exit 1
fi
echo ""

# Test 3: CORS Headers
echo "3️⃣  Testing CORS headers..."
CORS=$(curl -sI http://localhost:3000/api/pilots | grep -i "access-control")
if [[ ! -z "$CORS" ]]; then
    echo "✅ CORS headers present"
else
    echo "⚠️  CORS headers missing (might cause frontend issues)"
fi
echo ""

echo "=============================="
echo "✅ All tests passed!"
echo ""
echo "📊 Open Dashboard:"
echo "   open frontend/index.html"
echo ""
echo "🔍 View Pilot Data:"
echo "   curl http://localhost:3000/api/pilots | jq"
echo ""
echo "📈 Get Executive Report:"
echo "   curl http://localhost:3000/api/reports/executive | jq"
