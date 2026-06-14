const PINYIN_TONES = {
  a: ['ā', 'á', 'ǎ', 'à'], e: ['ē', 'é', 'ě', 'è'], i: ['ī', 'í', 'ǐ', 'ì'],
  o: ['ō', 'ó', 'ǒ', 'ò'], u: ['ū', 'ú', 'ǔ', 'ù'], v: ['ǖ', 'ǘ', 'ǚ', 'ǜ'], ü: ['ǖ', 'ǘ', 'ǚ', 'ǜ'],
  A: ['Ā', 'Á', 'Ǎ', 'À'], E: ['Ē', 'É', 'Ě', 'È'], I: ['Ī', 'Í', 'Ǐ', 'Ì'],
  O: ['Ō', 'Ó', 'Ǒ', 'Ò'], U: ['Ū', 'Ú', 'Ǔ', 'Ù'], V: ['Ǖ', 'Ǘ', 'Ǚ', 'Ǜ'], Ü: ['Ǖ', 'Ǘ', 'Ǚ', 'Ǜ'],
};

const KEYBOARDS = [
  { id: 'pinyin', title: '한어병음 입력/변환', desc: 'v 또는 ü 입력, 1부터 4까지 성조 숫자로 자동 변환', icon: '語', keys: ['q','w','e','r','t','y','u','i','o','p','ü','a','s','d','f','g','h','j','k','l','z','x','c','v','b','n','m'] },
  { id: 'roman', title: '로마자 변환', desc: '중국어 발음 로마자 조합을 빠르게 입력', icon: 'Aa', keys: ['b','p','m','f','d','t','n','l','g','k','h','j','q','x','zh','ch','sh','r','z','c','s','ai','ei','ao','ou','an','en','ang','eng','ong'] },
  { id: 'zhuyin', title: '주음부호 자판', desc: '보포모포와 성조 부호를 한 화면에서 입력', icon: 'ㄅ', keys: ['ㄅ','ㄆ','ㄇ','ㄈ','ㄉ','ㄊ','ㄋ','ㄌ','ㄍ','ㄎ','ㄏ','ㄐ','ㄑ','ㄒ','ㄓ','ㄔ','ㄕ','ㄖ','ㄗ','ㄘ','ㄙ','ㄧ','ㄨ','ㄩ','ㄚ','ㄛ','ㄜ','ㄝ','ㄞ','ㄟ','ㄠ','ㄡ','ㄢ','ㄣ','ㄤ','ㄥ','ㄦ','ˉ','ˊ','ˇ','ˋ','˙'] },
  { id: 'wubi', title: '오필자형 자판', desc: '오필자형 기본 자근을 간단히 입력', icon: '五', keys: ['王','土','大','木','工','目','日','口','田','山','禾','白','月','人','金','言','立','水','火','之','已','子','女','又','纟'] },
];

let mode = 'pinyin';
let upper = false;
const $ = selector => document.querySelector(selector);

function convertToneSyllable(raw, tone) {
  const syllable = raw.replace(/u:/gi, match => match[0] === 'U' ? 'Ü' : 'ü');
  let index = -1;
  for (const token of ['a', 'A', 'e', 'E', 'ou', 'Ou', 'OU', 'oU']) {
    const found = syllable.indexOf(token);
    if (found >= 0) { index = found; break; }
  }
  if (index === -1) {
    const vowels = [...syllable].map((char, idx) => ({ char, idx })).filter(({ char }) => 'aeiouvüAEIOUVÜ'.includes(char));
    if (vowels.length) index = vowels[vowels.length - 1].idx;
  }
  if (index === -1) return syllable;
  const char = syllable[index];
  const marked = PINYIN_TONES[char]?.[tone - 1];
  return marked ? syllable.slice(0, index) + marked + syllable.slice(index + 1) : syllable;
}

function convertPinyinNumbers(text) {
  return text.replace(/([A-Za-züÜ:]+)([1-4])/g, (_, syllable, tone) => convertToneSyllable(syllable, Number(tone)));
}

function button(label, className = '') {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = className;
  el.textContent = label;
  return el;
}

function setOutput(value) {
  $('#output').value = convertPinyinNumbers(value);
}

function addKey(value) {
  const next = upper && /^[a-z]+$/.test(value) ? value.toUpperCase() : value;
  setOutput($('#output').value + next);
  $('#output').focus();
}

function render() {
  const active = KEYBOARDS.find(item => item.id === mode);
  $('#modeIcon').textContent = active.icon;
  $('#modeTitle').textContent = active.title;
  $('#modeDesc').textContent = active.desc;
  $('#upperBtn').classList.toggle('on', upper);

  $('#tabs').replaceChildren(...KEYBOARDS.map(item => {
    const tab = button(item.title, mode === item.id ? 'tab active' : 'tab');
    tab.setAttribute('role', 'tab');
    tab.addEventListener('click', () => { mode = item.id; render(); });
    return tab;
  }));

  $('#toneBar').replaceChildren(...[1, 2, 3, 4].map(tone => {
    const toneButton = button(`${tone}성`);
    toneButton.addEventListener('click', () => setOutput($('#output').value + tone));
    return toneButton;
  }));

  const keyButtons = active.keys.map(key => {
    const label = upper && /^[a-z]+$/.test(key) ? key.toUpperCase() : key;
    const keyButton = button(label);
    keyButton.addEventListener('click', () => addKey(key));
    return keyButton;
  });
  const space = button('공백', 'wide');
  space.addEventListener('click', () => addKey(' '));
  const newline = button('줄바꿈', 'wide');
  newline.addEventListener('click', () => addKey('\n'));
  $('#keys').replaceChildren(...keyButtons, space, newline);
}

$('#output').addEventListener('input', event => setOutput(event.target.value));
$('#upperBtn').addEventListener('click', () => { upper = !upper; render(); });
$('#copyBtn').addEventListener('click', () => navigator.clipboard?.writeText($('#output').value));
$('#backBtn').addEventListener('click', () => setOutput([...$('#output').value].slice(0, -1).join('')));
$('#clearBtn').addEventListener('click', () => setOutput(''));

render();
