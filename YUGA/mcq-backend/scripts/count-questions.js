const fs = require('fs');
for (let i = 1; i <= 4; i++) {
  try {
    const content = fs.readFileSync(`d:/New folder/Coding/YUGA/mcq-backend/data/questions/macro_mock_test/macro_mock_test_${i}/macro_${i}.json`, 'utf8');
    const data = JSON.parse(content);
    console.log(`Total questions in macro_${i}.json:`, data.length);
  } catch (e) {
    console.log(`Error reading macro_${i}.json:`, e.message);
  }
}
