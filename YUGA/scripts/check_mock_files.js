const path = require('path');
const fs = require('fs');
const __dirname = path.join(process.cwd(), 'mcq-backend', 'modules', 'ai');
const mockTestDir = path.join(__dirname, '../../data/questions/mock_test');
console.log('mockTestDir=', mockTestDir);
console.log('exists mockTestDir', fs.existsSync(mockTestDir));
[1,2].forEach(n => {
  const paperFile = path.join(mockTestDir, `mock_test_paper_${n}`, `mock_paper_${n}.json`);
  console.log(n, paperFile, fs.existsSync(paperFile));
});
