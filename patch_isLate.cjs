const fs = require('fs');
let code = fs.readFileSync('src/pages/KamadPages.tsx', 'utf-8');

const targetLogic = `            if (isDone) {
              isLate = Boolean(idealDeadline && doneHM && isTimePastDeadline(doneHM, idealDeadline));
              if (isLate) {`;

const replaceLogic = `            if (isDone) {
              let isDoneBeforeToday = false;
              let doneDatePart = '';
              if (doneAtStr) {
                 const match = String(doneAtStr).match(/^(\\d{4}-\\d{2}-\\d{2})/);
                 if (match) {
                    doneDatePart = match[1];
                    if (doneDatePart < filterDateStr) {
                       isDoneBeforeToday = true;
                    }
                 }
              }

              if (isDoneBeforeToday) {
                 isLate = false; // Always on time if done before the filter date
              } else {
                 isLate = Boolean(idealDeadline && doneHM && isTimePastDeadline(doneHM, idealDeadline));
              }

              if (isLate) {`;

code = code.replace(targetLogic, replaceLogic);
fs.writeFileSync('src/pages/KamadPages.tsx', code);
