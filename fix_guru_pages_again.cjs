const fs = require('fs');
let code = fs.readFileSync('src/pages/GuruPages.tsx', 'utf8');

// Fix the bad closing tag at line 650
code = code.replace(`              </button>}
            </div>
            </>
          )}
        </CardContent>`, `              </button>}
            </div>
        </CardContent>`);
        
// Fix the missing closing tag in AbsensiZuhur
const correctFormEndRegex = /Simpan Absensi Zuhur<\/>\}\s*<\/button>\}\s*<\/div>\s*<\/CardContent>/;
code = code.replace(correctFormEndRegex, `Simpan Absensi Zuhur</>}
              </button>}
            </div>
            </>
          )}
        </CardContent>`);

fs.writeFileSync('src/pages/GuruPages.tsx', code);
console.log('Fixed syntax errors');
