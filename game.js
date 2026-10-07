/* =========================================================
   棍母小镇 · game.js 完整版
   原创搜打撤游戏 · 单文件逻辑
   包含：数据层 + 状态层 + 全部界面 + 局内循环 + 扩展系统
   ========================================================= */

/* =========================================================
   第一部分：数据层
   ========================================================= */

/* ---------- 5.1 变卖物生成 ---------- */

const LOOT_NAMES = {
  1: [
    '锈铁钉','破布条','空塑料瓶','旧电池','铜线圈','断扳手','黄胶带','油气打火机',
    '短铅笔','碎橡皮','铁螺丝','小弹簧','麻绳头','汽水瓶盖','湿纸板','塑料袋',
    '瘪铝罐','脏纱布','木楔子','橡皮筋','订书钉','弯回形针','半截牙签'
  ], // 23
  2: [
    '医用绷带','压缩能量棒','打火机油','黄铜管','废电缆','铁皮工具箱','防水帆布',
    '旧手电','五号电池组','军用水壶','硬饼干','止血带','铁口哨','指南针',
    '裂镜放大镜','温度计','听诊器','手术刀片','注射器','氧气罐','滤毒罐芯'
  ], // 21
  3: [
    '军用口粮','红外滤镜','加密U盘','SIM卡组','夜视仪镜片','消音器零件','四倍瞄准镜',
    '防弹插板','战术手套','军靴','头盔衬垫','水袋','GPS模块','短波电台','双筒望远镜',
    '红色信号弹','灰烟幕弹','闪光雷','破片手雷','燃烧瓶','C4塑胶炸药'
  ], // 21
  4: [
    '金壳手表','金手镯','镀金手机','碎钻戒指','银质胸针','老式摄影机','矿卡显卡',
    '钯金线材','除颤器','宫廷银器','激光指示模块','液压扳手','掌上游戏机','黑胶唱片机',
    '古董打字机','维修手册','金豹小雕像','青花茶壶','宝石项链','胰岛素泵',
    '精密水平仪','鎏金酒杯','纯金小块'
  ], // 23
  5: [
    '热成像模块','目标定位模块','碎纹花瓶','金狮雕像','盛宴雕塑','金魔方',
    '军用加密硬盘','卫星电话','夜视仪','防弹公文包','钛合金板','碳纤维布',
    '军用无人机','高级工具组','稀有化学品'
  ], // 15
  6: [
    '理想国芯片','军用主控芯片','核废料样本','古代金币','陨石碎片','生物样本容器',
    '量子处理器'
  ], // 7
  7: ['机密文件'] // 1
};

const LEVEL_PRICE = {
  1: [500, 3000], 2: [3000, 8000], 3: [8000, 20000],
  4: [20000, 60000], 5: [60000, 150000],
  6: [150000, 400000], 7: [800000, 900000]
};

const LEVEL_STYLE = {
  1: { icon:'🔩', cls:'lv1' }, 2: { icon:'🧰', cls:'lv2' },
  3: { icon:'📦', cls:'lv3' }, 4: { icon:'💎', cls:'lv4' },
  5: { icon:'🏆', cls:'lv5' }, 6: { icon:'👑', cls:'lv6' },
  7: { icon:'🗂️', cls:'lv7' }
};

const ALL_LOOT = [];
(function buildLoot(){
  let uid = 1;
  for (let lv = 1; lv <= 7; lv++) {
    const [lo, hi] = LEVEL_PRICE[lv];
    LOOT_NAMES[lv].forEach((name, i) => {
      const ratio = LOOT_NAMES[lv].length === 1 ? 1 : i / (LOOT_NAMES[lv].length - 1);
      const base = lo + (hi - lo) * ratio;
      const jitter = base * (Math.random() * 0.3 - 0.15);
      const price = Math.round((base + jitter) / 100) * 100;
      ALL_LOOT.push({
        id:'L'+uid++, name, level:lv, price,
        icon: LEVEL_STYLE[lv].icon, cls: LEVEL_STYLE[lv].cls
      });
    });
  }
})();

/* ---------- 5.2 枪械（15 把） ---------- */

const WEAPONS = [
  { id:'W01', name:'锈蜂 PDW-9',  price:1000,   dmg:15, rate:900, mag:30, desc:'廉价冲锋枪，近距离泼水' },
  { id:'W02', name:'矿工 M870',   price:3000,   dmg:45, rate:60,  mag:6,  desc:'泵动霰弹，贴脸秒人' },
  { id:'W03', name:'夜莺 MP5',    price:8000,   dmg:20, rate:800, mag:30, desc:'均衡冲锋，新手最爱' },
  { id:'W04', name:'红壤 AK74N',  price:15000,  dmg:32, rate:650, mag:30, desc:'经典突击步枪' },
  { id:'W05', name:'铁砧 SKS',    price:22000,  dmg:38, rate:300, mag:10, desc:'半自动，稳准狠' },
  { id:'W06', name:'峡谷 BM59',   price:26000,  dmg:42, rate:350, mag:20, desc:'战斗步枪，中距离压制' },
  { id:'W07', name:'远钟 M14',    price:35000,  dmg:55, rate:250, mag:20, desc:'连狙，一枪一个小朋友' },
  { id:'W08', name:'白桦 Mosin',  price:39000,  dmg:85, rate:40,  mag:5,  desc:'栓动狙击，穿甲利器' },
  { id:'W09', name:'沙狐 MDR',    price:45000,  dmg:40, rate:700, mag:30, desc:'无托突击，机动性强' },
  { id:'W10', name:'长枪管 M4A1', price:75000,  dmg:35, rate:800, mag:30, desc:'全能突击，改装空间大' },
  { id:'W11', name:'赤铁 AK-102', price:93000,  dmg:38, rate:650, mag:30, desc:'改良型 AK，后坐力低' },
  { id:'W12', name:'鹰眼 AUG',    price:120000, dmg:40, rate:750, mag:30, desc:'自带倍镜，中远通吃' },
  { id:'W13', name:'大西洋 FAL',  price:180000, dmg:52, rate:630, mag:20, desc:'大口径突击，两枪破甲' },
  { id:'W14', name:'幽灵 H416',   price:280000, dmg:45, rate:850, mag:30, desc:'顶级突击，稳如老狗' },
  { id:'W15', name:'审判 MK14',   price:450000, dmg:70, rate:400, mag:20, desc:'顶级连狙，一枪定生死' }
];

/* ---------- 5.3 防具（6 级甲 + 6 级盔） ---------- */

const ARMORS = [
  { id:'A1', name:'特勤防弹衣',   price:2000,   dur:35, red:0.20, tier:1 },
  { id:'A2', name:'H-Tac 特勤甲', price:4500,   dur:45, red:0.30, tier:2 },
  { id:'A3', name:'KN 制式甲',    price:30000,  dur:55, red:0.45, tier:3 },
  { id:'A4', name:'SEK 壁垒甲',   price:100000, dur:65, red:0.55, tier:4 },
  { id:'A5', name:'926 复合甲',   price:200000, dur:75, red:0.65, tier:5 },
  { id:'A6', name:'IMTV 武士甲',  price:450000, dur:90, red:0.75, tier:6 }
];

const HELMETS = [
  { id:'H1', name:'工地安全帽',   price:800,    dur:20, red:0.15, tier:1 },
  { id:'H2', name:'战术软帽',     price:2500,   dur:28, red:0.25, tier:2 },
  { id:'H3', name:'KN 防弹盔',    price:18000,  dur:38, red:0.40, tier:3 },
  { id:'H4', name:'SEK 重型盔',   price:60000,  dur:50, red:0.52, tier:4 },
  { id:'H5', name:'926 复合盔',   price:130000, dur:62, red:0.62, tier:5 },
  { id:'H6', name:'IMTV 武士盔',  price:280000, dur:78, red:0.72, tier:6 }
];

/* ---------- 5.4 药品（3 种） ---------- */

const MEDS = [
  { id:'M1', name:'简易急救包', price:800,  heal:0.33, icon:'🩹' },
  { id:'M2', name:'军用急救包', price:2500, heal:0.50, icon:'💉' },
  { id:'M3', name:'白色医疗箱', price:8000, heal:1.00, icon:'🧰' }
];

/* ---------- 5.5 敌人（10 普通 + 1 Boss） ---------- */

const ENEMIES = [
  { id:'E01', name:'流浪拾荒者',   hp:60,  dmg:8,  speed:0.4, dropTier:'low',  icon:'🧟' },
  { id:'E02', name:'武装匪徒',     hp:90,  dmg:15, speed:0.6, dropTier:'low',  icon:'🥷' },
  { id:'E03', name:'巡逻哨兵',     hp:80,  dmg:12, speed:0.7, dropTier:'low',  icon:'💂' },
  { id:'E04', name:'精英斥候',     hp:110, dmg:20, speed:0.9, dropTier:'mid',  icon:'🕵️' },
  { id:'E05', name:'重装守卫',     hp:150, dmg:18, speed:0.3, dropTier:'mid',  icon:'🛡️' },
  { id:'E06', name:'屋顶狙击手',   hp:70,  dmg:35, speed:0.2, dropTier:'mid',  icon:'🎯' },
  { id:'E07', name:'废墟突击兵',   hp:100, dmg:22, speed:0.8, dropTier:'mid',  icon:'🔫' },
  { id:'E08', name:'爆破专家',     hp:95,  dmg:28, speed:0.5, dropTier:'high', icon:'💣' },
  { id:'E09', name:'随队医疗兵',   hp:85,  dmg:10, speed:0.6, dropTier:'high', icon:'⛑️' },
  { id:'E10', name:'精英指挥官',   hp:130, dmg:25, speed:0.7, dropTier:'high', icon:'🎖️' }
];

const BOSS = {
  id:'BOSS', name:'“棍母”镇长', hp:500, dmg:40, speed:0.5,
  dropTier:'boss', icon:'👺',
  // 扩展 5：Boss 专属掉落
  specialDrop: { id:'L-SP1', name:'镇长的金印章', level:6, price:520000, icon:'🔱', cls:'lv6' }
};

/* ---------- 5.6 物资容器（14 种） ---------- */

const CONTAINERS = [
  { id:'C01', name:'军用保险箱', tier:'low',  icon:'🗄️' },
  { id:'C02', name:'加密集装箱', tier:'low',  icon:'📦' },
  { id:'C03', name:'医疗空投',   tier:'low',  icon:'🚁' },
  { id:'C04', name:'武器箱',     tier:'low',  icon:'🔫' },
  { id:'C05', name:'电子保险箱', tier:'low',  icon:'💻' },
  { id:'C06', name:'军用背包',   tier:'mid',  icon:'🎒' },
  { id:'C07', name:'弹药箱',     tier:'mid',  icon:'📦' },
  { id:'C08', name:'工具箱',     tier:'mid',  icon:'🧰' },
  { id:'C09', name:'旅行箱',     tier:'mid',  icon:'🧳' },
  { id:'C10', name:'抽屉',       tier:'mid',  icon:'🗃️' },
  { id:'C11', name:'普通补给箱', tier:'high', icon:'📮' },
  { id:'C12', name:'散落物资点', tier:'high', icon:'🧷' },
  { id:'C13', name:'衣柜',       tier:'high', icon:'🚪' },
  { id:'C14', name:'废弃车辆',   tier:'high', icon:'🚗' }
];

const DROP_RATE = {
  low:  { 1:0.05, 2:0.10, 3:0.20, 4:0.35, 5:0.20, 6:0.08, 7:0.02 },
  mid:  { 1:0.15, 2:0.25, 3:0.30, 4:0.20, 5:0.08, 6:0.02, 7:0.00 },
  high: { 1:0.40, 2:0.35, 3:0.20, 4:0.05, 5:0.00, 6:0.00, 7:0.00 },
  boss: { 1:0.00, 2:0.05, 3:0.10, 4:0.25, 5:0.35, 6:0.20, 7:0.05 }
};

/* ---------- 扩展 8：多地图数据 ---------- */

const MAPS = {
  town:     { id:'town',     name:'棍母小镇', desc:'废弃矿区旁的居民点', enemyMul:1.0,  lootMul:1.0 },
  mine:     { id:'mine',     name:'废弃矿洞', desc:'塌方频发，但矿脉里全是宝', enemyMul:1.3, lootMul:1.4 },
  facility: { id:'facility', name:'旧军事设施', desc:'危险等级最高，机密文件出没', enemyMul:1.6, lootMul:1.9 }
};

/* ---------- 扩展 7：音效（Web Audio 合成，不用素材） ---------- */

let audioCtx = null;
function beep(freq, dur, type='square', vol=0.04) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.value = vol;
    o.connect(g); g.connect(audioCtx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
    o.stop(audioCtx.currentTime + dur);
  } catch(e) {}
}
const SFX = {
  shoot:   () => beep(220, 0.06, 'square', 0.05),
  hit:     () => beep(120, 0.10, 'sawtooth', 0.05),
  pickup:  () => beep(880, 0.08, 'triangle', 0.04),
  coin:    () => { beep(660, 0.06, 'sine', 0.05); setTimeout(()=>beep(990, 0.08, 'sine', 0.05), 60); },
  death:   () => beep(80, 0.6, 'sawtooth', 0.08),
  extract: () => { beep(520, 0.1); setTimeout(()=>beep(780, 0.1), 100); setTimeout(()=>beep(1040, 0.15), 200); }
};

/* =========================================================
   第二部分：状态层
   ========================================================= */

const SAVE_KEY = 'gunmu_town_save_v1';
let G = null;

function newGame() {
  return {
    money: 500000,
    warehouse: [],
    equipment: { weapon:null, armor:null, helmet:null, meds:[] },
    stats: { raids:0, extracts:0, deaths:0, kills:0 },
    // 扩展 6：任务系统
    quest: { id:'q1', name:'首次撤离', desc:'完成 1 次成功撤离', target:1, progress:0, reward:20000, done:false },
    // 扩展 8：解锁的地图
    unlockedMaps: ['town']
  };
}

function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(G)); }
  catch(e) { console.warn('存档失败', e); }
}

function load() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (raw) {
    try { G = JSON.parse(raw); } catch(e) { G = newGame(); }
  } else G = newGame();
  if (!G.equipment) G.equipment = { weapon:null, armor:null, helmet:null, meds:[] };
  if (!G.equipment.meds) G.equipment.meds = [];
  if (!G.stats) G.stats = { raids:0, extracts:0, deaths:0, kills:0 };
  if (!G.quest) G.quest = { id:'q1', name:'首次撤离', desc:'完成 1 次成功撤离', target:1, progress:0, reward:20000, done:false };
  if (!G.unlockedMaps) G.unlockedMaps = ['town'];
}

/* ---------- 工具 ---------- */

const $  = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const fmt = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const rand = (a,b) => Math.floor(Math.random()*(b-a+1))+a;
const randPick = a => a[Math.floor(Math.random()*a.length)];
const clone = o => JSON.parse(JSON.stringify(o));

function rollLevel(tier) {
  const table = DROP_RATE[tier];
  const r = Math.random();
  let acc = 0;
  for (let lv = 1; lv <= 7; lv++) {
    acc += table[lv];
    if (r < acc) return lv;
  }
  return 1;
}
function rollLoot(tier) {
  const lv = rollLevel(tier);
  const pool = ALL_LOOT.filter(x => x.level === lv);
  return clone(randPick(pool));
}
function addToWarehouse(item) {
  if (!item) return;
  if (!item.uid) item.uid = 'U' + Date.now() + Math.random().toString(36).slice(2,6);
  G.warehouse.push(item);
}
function removeFromWarehouse(uid) {
  const i = G.warehouse.findIndex(x => x.uid === uid);
  if (i >= 0) G.warehouse.splice(i, 1);
}

/* =========================================================
   第三部分：界面渲染
   ========================================================= */

function go(name) {
  $$('.screen').forEach(s => s.classList.add('hidden'));
  const el = $('#scr-' + name);
  if (el) el.classList.remove('hidden');
  if (name === 'warehouse') renderWarehouse();
  if (name === 'market')    renderMarket('buy-weapon');
  if (name === 'loadout')   renderLoadout();
  if (name === 'map')       renderMap();
  if (name === 'quest')     renderQuest();
}

function renderTopbar() {
  $('#money').textContent = fmt(G.money);
  $('#wh-count').textContent = G.warehouse.length;
}

function renderAll() { renderTopbar(); renderWarehouse(); }

/* ---------- 仓库 ---------- */

function renderWarehouse() {
  renderTopbar();
  const grid = $('#warehouse-grid');
  grid.innerHTML = '';
  if (G.warehouse.length === 0) {
    grid.innerHTML = '<p style="grid-column:1/-1;color:#666;text-align:center;padding:40px">仓库空空如也，去地图里搜点东西吧。</p>';
    return;
  }
  [...G.warehouse].sort((a,b) => (b.level||0)-(a.level||0)).forEach(item => {
    const card = document.createElement('div');
    card.className = 'item ' + (item.cls || 'lv1');
    card.innerHTML = `
      <span class="lvl">${item.level ? 'Lv'+item.level : ''}</span>
      <span class="emoji">${item.icon || '❔'}</span>
      <span class="price">${fmt(item.price||0)}</span>
    `;
    card.onclick = () => showItemDetail(item);
    grid.appendChild(card);
  });
}

function showItemDetail(item) {
  const panel = $('#item-detail');
  panel.classList.remove('hidden');
  panel.innerHTML = `
    <h3>${item.name}</h3>
    <p>等级：${item.level || '—'}</p>
    <p>估价：${fmt(item.price)} 柯恩币</p>
    <p>出售可得：${fmt(Math.floor(item.price * 0.8))}</p>
    <button id="btn-sell-one">出售</button>
    <button id="btn-close-detail" style="background:#444;color:#d8d4c4;margin-top:4px">关闭</button>
  `;
  $('#btn-sell-one').onclick = () => {
    G.money += Math.floor(item.price * 0.8);
    removeFromWarehouse(item.uid);
    SFX.coin();
    save(); panel.classList.add('hidden'); renderWarehouse();
  };
  $('#btn-close-detail').onclick = () => panel.classList.add('hidden');
}

/* ---------- 市场 ---------- */

function renderMarket(tab) {
  renderTopbar();
  $$('.tabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  const body = $('#market-body');
  body.innerHTML = '';

  if (tab === 'buy-weapon') {
    WEAPONS.forEach(w => body.appendChild(marketCard({
      icon:'🔫', name:w.name, price:w.price,
      sub:`伤害 ${w.dmg} · 射速 ${w.rate} · 弹匣 ${w.mag}`,
      desc:w.desc, onBuy: () => buyEquip('weapon', w)
    })));
  } else if (tab === 'buy-armor') {
    ARMORS.forEach(a => body.appendChild(marketCard({
      icon:'🛡️', name:a.name, price:a.price,
      sub:`${a.tier}级甲 · 耐久 ${a.dur} · 减伤 ${Math.round(a.red*100)}%`,
      onBuy: () => buyEquip('armor', a)
    })));
    HELMETS.forEach(h => body.appendChild(marketCard({
      icon:'⛑️', name:h.name, price:h.price,
      sub:`${h.tier}级盔 · 耐久 ${h.dur} · 减伤 ${Math.round(h.red*100)}%`,
      onBuy: () => buyEquip('helmet', h)
    })));
  } else if (tab === 'buy-med') {
    MEDS.forEach(m => body.appendChild(marketCard({
      icon:m.icon, name:m.name, price:m.price,
      sub:`恢复 ${Math.round(m.heal*100)}% 生命`,
      onBuy: () => buyMed(m)
    })));
  } else if (tab === 'sell') {
    if (G.warehouse.length === 0) {
      body.innerHTML = '<p style="grid-column:1/-1;color:#666;text-align:center;padding:40px">仓库没有可卖的物品。</p>';
      return;
    }
    [...G.warehouse].sort((a,b)=>(b.level||0)-(a.level||0)).forEach(item => {
      body.appendChild(marketCard({
        icon:item.icon||'❔', name:item.name, price:Math.floor((item.price||0)*0.8),
        sub:`Lv${item.level||'—'} · 原价 ${fmt(item.price||0)}`,
        onBuy: () => {
          G.money += Math.floor(item.price * 0.8);
          removeFromWarehouse(item.uid);
          SFX.coin(); save(); renderMarket('sell');
        },
        buyLabel:'出售'
      }));
    });
  }
}

function marketCard({icon, name, price, sub, desc, onBuy, buyLabel='购买'}) {
  const c = document.createElement('div');
  c.className = 'item lv3';
  c.style.aspectRatio = 'auto';
  c.style.padding = '10px';
  c.style.textAlign = 'left';
  c.style.alignItems = 'flex-start';
  c.innerHTML = `
    <div style="font-size:24px">${icon}</div>
    <div style="font-size:12px;color:#ffd700;margin:4px 0">${name}</div>
    <div style="font-size:10px;color:#8a8578;line-height:1.4">${sub||''}</div>
    <div style="font-size:12px;color:#c8742a;margin:6px 0">${fmt(price)} 柯恩币</div>
    <button style="background:#c8742a;color:#0d0f0c;border:none;padding:4px 10px;border-radius:3px;font-size:11px">${buyLabel}</button>
  `;
  c.querySelector('button').onclick = e => { e.stopPropagation(); onBuy(); };
  return c;
}

function buyEquip(slot, data) {
  if (G.money < data.price) { alert('柯恩币不足'); return; }
  G.money -= data.price;
  const item = clone(data);
  item.kind = slot;
  item.uid = 'U' + Date.now() + Math.random().toString(36).slice(2,6);
  if (slot === 'med') {
    if (G.equipment.meds.length >= 3) { alert('药品已满（3 个）'); G.money += data.price; return; }
    G.equipment.meds.push(item);
  } else {
    G.equipment[slot] = item;
  }
  SFX.pickup(); save();
  renderMarket(slot === 'weapon' ? 'buy-weapon' : (slot === 'armor' || slot === 'helmet') ? 'buy-armor' : 'buy-med');
  renderTopbar();
}
function buyMed(m) {
  if (G.money < m.price) { alert('柯恩币不足'); return; }
  if (G.equipment.meds.length >= 3) { alert('最多携带 3 个药品'); return; }
  G.money -= m.price;
  const item = clone(m); item.kind = 'med';
  item.uid = 'U' + Date.now() + Math.random().toString(36).slice(2,6);
  G.equipment.meds.push(item);
  SFX.pickup(); save(); renderMarket('buy-med'); renderTopbar();
}

/* ---------- 装备 ---------- */

function renderLoadout() {
  renderTopbar();
  const eq = G.equipment;
  setSlot('#slot-weapon', eq.weapon);
  setSlot('#slot-armor',  eq.armor);
  setSlot('#slot-helmet', eq.helmet);
  const medSlot = $('#slot-meds');
  medSlot.querySelector('span').textContent = eq.meds.length ? eq.meds.map(m => m.name).join(' / ') : '—';
  medSlot.classList.toggle('filled', eq.meds.length > 0);

  // 显示当前装备详情 + 卸下按钮
  const info = $('#loadout-info') || (() => {
    const d = document.createElement('div'); d.id = 'loadout-info'; d.style.marginTop = '10px';
    $('#loadout-picker').parentNode.insertBefore(d, $('#loadout-picker'));
    return d;
  })();
  info.innerHTML = '<p style="font-size:12px;color:#8a8578">点击下方物品可替换装备。点击装备槽可卸下。</p>';
  ['#slot-weapon','#slot-armor','#slot-helmet'].forEach(sel => {
    const el = $(sel);
    el.onclick = () => {
      const key = sel.replace('#slot-','');
      if (G.equipment[key]) { G.equipment[key] = null; save(); renderLoadout(); }
    };
  });
  $('#slot-meds').onclick = () => { if (G.equipment.meds.length) { G.equipment.meds = []; save(); renderLoadout(); } };
}

function setSlot(sel, item) {
  const el = $(sel);
  el.querySelector('span').textContent = item ? item.name : '—';
  el.classList.toggle('filled', !!item);
}

/* ---------- 地图 ---------- */

const DIFFICULTY = {
  normal:   { name:'普通', ec:[5,8],   luck:1.0, boss:false, minValue:0 },
  hard:     { name:'困难', ec:[8,12],  luck:1.5, boss:false, minValue:50000 },
  lockdown: { name:'封锁', ec:[12,15], luck:2.5, boss:true,  minValue:150000 }
};

function equipValue() {
  const e = G.equipment;
  let v = 0;
  if (e.weapon) v += e.weapon.price||0;
  if (e.armor)  v += e.armor.price||0;
  if (e.helmet) v += e.helmet.price||0;
  e.meds.forEach(m => v += m.price||0);
  return v;
}

function renderMap() {
  renderTopbar();
  const body = $('#scr-map');
  const mapList = Object.values(MAPS).map(m => {
    const locked = !G.unlockedMaps.includes(m.id);
    return `<div class="map-card" style="margin-bottom:10px;${locked?'opacity:.4':''}">
      <div class="map-name">${m.name}</div>
      <div class="map-desc">${m.desc}${locked?' · <span style="color:#f44">未解锁</span>':''}</div>
      ${locked ? '' : `
      <div class="difficulty-row">
        <button data-map="${m.id}" data-diff="normal">普通 ×1.0</button>
        <button data-map="${m.id}" data-diff="hard">困难 ×1.5</button>
        <button data-map="${m.id}" data-diff="lockdown">封锁 ×2.5 Boss</button>
      </div>`}
    </div>`;
  }).join('');
  body.innerHTML = `
    <h2>选择地图</h2>
    ${mapList}
    <div style="margin-top:16px;font-size:12px;color:#8a8578">
      <p>携带装备价值：${fmt(equipValue())} 柯恩币</p>
      <p>困难需 ≥ 5 万 · 封锁需 ≥ 15 万</p>
    </div>
  `;
  body.querySelectorAll('.difficulty-row button').forEach(btn => {
    btn.onclick = () => startRaid(btn.dataset.map, btn.dataset.diff);
  });
}

/* ---------- 扩展 6：任务界面 ---------- */

function renderQuest() {
  renderTopbar();
  const body = $('#scr-quest');
  if (!body) return;
  const q = G.quest;
  body.innerHTML = `
    <h2>任务</h2>
    <div class="map-card">
      <div class="map-name" style="font-size:18px">${q.name}</div>
      <div class="map-desc">${q.desc}</div>
      <p style="font-size:13px;color:#c8742a;margin:10px 0">进度：${q.progress} / ${q.target}</p>
      <p style="font-size:12px;color:#8a8578">奖励：${fmt(q.reward)} 柯恩币</p>
      ${q.done ? '<p style="color:#4caf50;margin-top:10px">✅ 已完成</p>' : ''}
    </div>
    <div class="map-card" style="margin-top:10px;opacity:.5">
      <div class="map-name" style="font-size:16px">更多任务</div>
      <div class="map-desc">后续版本开放</div>
    </div>
  `;
}

function updateQuest(type) {
  const q = G.quest;
  if (q.done) return;
  if (q.id === 'q1' && type === 'extract') q.progress = Math.min(q.target, q.progress + 1);
  if (q.progress >= q.target) {
    q.done = true;
    G.money += q.reward;
    alert(`任务完成：${q.name}\n奖励 ${fmt(q.reward)} 柯恩币`);
    // 解锁下一张地图
    if (!G.unlockedMaps.includes('mine')) G.unlockedMaps.push('mine');
  }
}

/* =========================================================
   第四部分：局内搜打撤
   ========================================================= */

let raid = null;
let raidTimer = null;
let playerPos = { x: 10, y: 40 }; // 百分比坐标
let searching = false;

function startRaid(mapId, diffKey) {
  const diff = DIFFICULTY[diffKey];
  const map  = MAPS[mapId];
  if (!G.equipment.weapon) { alert('请先装备一把武器'); return; }
  if (equipValue() < diff.minValue) {
    alert(`${diff.name}难度需携带价值 ≥ ${fmt(diff.minValue)} 的装备`);
    return;
  }

  const field = $('#raid-field');
  field.innerHTML = '';

  // 扩展 3：护甲耐久在局内被消耗，初始化时拷贝一份
  const armor  = G.equipment.armor  ? clone(G.equipment.armor)  : null;
  const helmet = G.equipment.helmet ? clone(G.equipment.helmet) : null;

  raid = {
    mapId, diff: diffKey, luck: diff.luck * map.lootMul,
    hp: 100, maxHp: 100, timeLeft: 300,
    lootValue: 0, backpack: [],
    enemies: [], boxes: [], extract: null,
    armor, helmet, log: [], over: false,
    ammo: G.equipment.weapon.mag, // 扩展 2：弹匣
    magSize: G.equipment.weapon.mag
  };

  // 玩家
  const pEl = document.createElement('div');
  pEl.id = 'player';
  pEl.textContent = '🧍';
  pEl.style.cssText = `position:absolute;width:36px;height:36px;font-size:26px;
    left:${playerPos.x}%;top:${playerPos.y}%;transition:left .1s,top .1s;z-index:5;
    filter:drop-shadow(0 0 6px #c8742a);`;
  field.appendChild(pEl);

  // 敌人
  const count = rand(diff.ec[0], diff.ec[1]);
  for (let i = 0; i < count; i++) spawnEnemy(randPick(ENEMIES), field);
  if (diff.boss) spawnEnemy(BOSS, field);

  // 容器（地图 lootMul 提高容器数量）
  const boxCount = Math.round(12 * map.lootMul);
  for (let i = 0; i < boxCount; i++) spawnBox(randPick(CONTAINERS), field);

  spawnExtract(field);
  bindJoystick();

  go('raid');
  renderRaidHUD();
  clearInterval(raidTimer);
  raidTimer = setInterval(() => {
    if (!raid || raid.over) return;
    raid.timeLeft--;
    if (raid.timeLeft <= 0) { endRaid(false); return; }
    renderRaidHUD();
  }, 1000);
}

function spawnEnemy(tpl, field) {
  const el = document.createElement('div');
  el.className = 'enemy' + (tpl.id === 'BOSS' ? ' boss' : '');
  el.textContent = tpl.icon;
  el.style.left = rand(15, 90) + '%';
  el.style.top  = rand(15, 80) + '%';
  const obj = { el, tpl: clone(tpl), hp: tpl.hp, alive: true, cd: 0 };
  el.onclick = e => { e.stopPropagation(); attackEnemy(obj); };
  raid.enemies.push(obj);
  field.appendChild(el);
}

function spawnBox(tpl, field) {
  const el = document.createElement('div');
  el.className = 'loot-box';
  el.textContent = tpl.icon;
  el.style.left = rand(5, 90) + '%';
  el.style.top  = rand(15, 80) + '%';
  const obj = { el, tpl, searched: false };
  el.onclick = e => { e.stopPropagation(); searchBox(obj); };
  raid.boxes.push(obj);
  field.appendChild(el);
}

function spawnExtract(field) {
  const el = document.createElement('div');
  el.className = 'extract-zone';
  el.textContent = '撤离';
  el.style.left = rand(2, 85) + '%';
  el.style.top  = rand(10, 78) + '%';
  el.onclick = e => { e.stopPropagation(); tryExtract(); };
  raid.extract = el;
  field.appendChild(el);
}

/* ---------- 扩展 1：虚拟摇杆 ---------- */

function bindJoystick() {
  // 在 #raid-field 上滑动移动玩家
  const field = $('#raid-field');
  let dragging = false;
  field.addEventListener('touchstart', e => { dragging = true; }, { passive:true });
  field.addEventListener('touchmove', e => {
    if (!dragging || !raid || raid.over) return;
    const t = e.touches[0];
    const rect = field.getBoundingClientRect();
    const x = ((t.clientX - rect.left) / rect.width) * 100;
    const y = ((t.clientY - rect.top) / rect.height) * 100;
    movePlayer(x, y);
  }, { passive:true });
  field.addEventListener('touchend', () => { dragging = false; });
  // 桌面端也支持鼠标
  field.addEventListener('mousemove', e => {
    if (!raid || raid.over || e.buttons !== 1) return;
    const rect = field.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    movePlayer(x, y);
  });
}

function movePlayer(x, y) {
  playerPos.x = Math.max(2, Math.min(96, x));
  playerPos.y = Math.max(8, Math.min(90, y));
  const p = $('#player');
  if (p) { p.style.left = playerPos.x + '%'; p.style.top = playerPos.y + '%'; }
}

/* ---------- 扩展 2：子弹与弹匣 ---------- */

function fireOnce() {
  if (!raid || raid.over) return false;
  if (raid.ammo <= 0) {
    raid.log.push('弹匣空了！按换弹 (R)');
    renderRaidHUD();
    return false;
  }
  raid.ammo--;
  SFX.shoot();
  return true;
}

function reload() {
  if (!raid || raid.over) return;
  raid.ammo = raid.magSize;
  raid.log.push('换弹完成');
  beep(300, 0.1, 'triangle', 0.04);
  renderRaidHUD();
}

/* ---------- 战斗 ---------- */

function attackEnemy(obj) {
  if (!obj || !obj.alive || !raid || raid.over) return;
  if (!fireOnce()) return;
  const w = G.equipment.weapon;
  const dmg = w ? w.dmg : 5;
  obj.hp -= dmg;
  SFX.hit();
  obj.el.style.transform = 'scale(1.2)';
  setTimeout(() => obj.el.style.transform = '', 100);

  if (obj.hp <= 0) {
    obj.alive = false;
    obj.el.classList.add('dead');
    raid.log.push(`击杀 ${obj.tpl.name}`);
    G.stats.kills++;

    // 掉落
    const drop = rollLoot(obj.tpl.dropTier);
    if (drop) {
      raid.backpack.push(drop);
      raid.lootValue += drop.price;
      raid.log.push(`拾取 ${drop.name}（${fmt(drop.price)}）`);
      SFX.pickup();
    }
    // 扩展 5：Boss 专属掉落
    if (obj.tpl.id === 'BOSS' && Math.random() < 0.6) {
      const sp = clone(BOSS.specialDrop);
      sp.uid = 'U' + Date.now() + Math.random().toString(36).slice(2,6);
      raid.backpack.push(sp);
      raid.lootValue += sp.price;
      raid.log.push(`★ 掉落 ${sp.name}`);
      SFX.coin();
    }
    renderRaidHUD();
    return;
  }
  // 敌人反击（带冷却，避免点击过快被瞬秒）
  const now = Date.now();
  if (now - obj.cd > 800) {
    obj.cd = now;
    enemyAttack(obj);
  }
}

function enemyAttack(obj) {
  let dmg = obj.tpl.dmg;
  // 扩展 3：护甲耐久消耗
  let red = 0;
  if (raid.armor && raid.armor.dur > 0) {
    red += raid.armor.red;
    raid.armor.dur -= rand(1, 3);
    if (raid.armor.dur < 0) raid.armor.dur = 0;
  }
  if (raid.helmet && raid.helmet.dur > 0) {
    red += raid.helmet.red * 0.5;
    raid.helmet.dur -= rand(1, 2);
    if (raid.helmet.dur < 0) raid.helmet.dur = 0;
  }
  dmg = dmg * (1 - Math.min(red, 0.85));
  raid.hp -= dmg;
  if (raid.hp <= 0) { raid.hp = 0; endRaid(false); }
  renderRaidHUD();
}

/* ---------- 搜索 ---------- */

function searchBox(obj) {
  if (searching || !obj || obj.searched || !raid || raid.over) return;
  searching = true;
  raid.log.push('搜索中...');
  renderRaidHUD();
  setTimeout(() => {
    if (!raid || raid.over) { searching = false; return; }
    obj.searched = true;
    obj.el.style.opacity = '.3';
    const drop = rollLoot(obj.tpl.tier);
    if (drop) {
      raid.backpack.push(drop);
      raid.lootValue += drop.price;
      raid.log.push(`获得 ${drop.name}（${fmt(drop.price)}）`);
      SFX.pickup();
    } else raid.log.push('空空如也');
    searching = false;
    renderRaidHUD();
  }, 1200);
}

function searchNearest() {
  if (!raid) return;
  // 找离玩家最近的未搜容器
  let best = null, bestD = Infinity;
  raid.boxes.forEach(b => {
    if (b.searched) return;
    const bx = parseFloat(b.el.style.left), by = parseFloat(b.el.style.top);
    const d = (bx - playerPos.x) ** 2 + (by - playerPos.y) ** 2;
    if (d < bestD) { bestD = d; best = b; }
  });
  if (best) searchBox(best);
  else raid.log.push('附近没有可搜的容器');
}

/* ---------- 撤离 & 结束 ---------- */

function tryExtract() {
  if (!raid || raid.over) return;
  // 需靠近撤离点
  const ex = parseFloat(raid.extract.style.left), ey = parseFloat(raid.extract.style.top);
  const d = Math.hypot(ex - playerPos.x, ey - playerPos.y);
  if (d > 12) { raid.log.push('离撤离点太远'); renderRaidHUD(); return; }
  // 附近有活敌则不允许
  const nearEnemy = raid.enemies.some(e => e.alive && Math.random() < 0.4);
  if (nearEnemy) { raid.log.push('附近有敌人，无法撤离！'); renderRaidHUD(); return; }
  endRaid(true);
}

function endRaid(success) {
  if (raid.over) return;
  raid.over = true;
  clearInterval(raidTimer);
  G.stats.raids++;

  if (success) {
    G.stats.extracts++;
    raid.backpack.forEach(addToWarehouse);
    SFX.extract();
    updateQuest('extract');
  } else {
    G.stats.deaths++;
    // 死亡：装备 + 背包全掉
    G.equipment = { weapon:null, armor:null, helmet:null, meds:[] };
    SFX.death();
  }
  save();
  showResult(success);
}

function showResult(success) {
  $('#result-title').textContent = success ? '撤离成功' : '任务失败 · 装备丢失';
  const body = $('#result-body');
  if (success) {
    body.innerHTML = `
      <p>带回 ${raid.backpack.length} 件物资，总价值 ${fmt(raid.lootValue)} 柯恩币。</p>
      <p>已存入仓库。</p>
      <p>击杀：${G.stats.kills} · 累计撤离：${G.stats.extracts}</p>
    `;
  } else {
    body.innerHTML = `
      <p>你在 ${MAPS[raid.mapId].name} 倒下了。</p>
      <p>携带的武器、护甲、头盔、药品全部丢失。</p>
      <p>仓库物资安全。</p>
    `;
  }
  go('result');
  renderTopbar();
}

/* ---------- 局内 HUD ---------- */

function renderRaidHUD() {
  if (!raid) return;
  $('#hp').textContent = Math.max(0, Math.round(raid.hp));
  $('#raid-loot').textContent = fmt(raid.lootValue);
  const m = String(Math.floor(raid.timeLeft/60)).padStart(2,'0');
  const s = String(raid.timeLeft % 60).padStart(2,'0');
  $('#raid-timer').textContent = `${m}:${s}  🔫 ${raid.ammo}/${raid.magSize}`;
  const log = $('#raid-log');
  log.innerHTML = raid.log.slice(-4).map(l => '· ' + l).join('<br>');
}

/* =========================================================
   第五部分：启动 & 事件绑定
   ========================================================= */

function bindEvents() {
  $$('#bottomnav button').forEach(btn => {
    btn.onclick = () => go(btn.dataset.go);
  });
  $$('.tabs button').forEach(btn => {
    btn.onclick = () => renderMarket(btn.dataset.tab);
  });
  const bs = $('#btn-search');   if (bs) bs.onclick = searchNearest;
  const be = $('#btn-extract');  if (be) be.onclick = tryExtract;
  const bb = $('#btn-back');     if (bb) bb.onclick = () => go('warehouse');

  // 快捷键
  window.addEventListener('keydown', e => {
    if (!raid || raid.over) return;
    if (e.key === 'e' || e.key === 'E') searchNearest();
    if (e.key === 'r' || e.key === 'R') reload();
  });

  window.addEventListener('resize', checkOrientation);
  window.addEventListener('orientationchange', checkOrientation);
}

function checkOrientation() {
  const tip = $('#rotate-tip');
  if (!tip) return;
  tip.style.display = (window.innerHeight > window.innerWidth) ? 'flex' : 'none';
}

function boot() {
  load();
  bindEvents();
  checkOrientation();
  renderTopbar();
  go('warehouse');
}

window.addEventListener('DOMContentLoaded', boot);

// 兜底：如果 DOMContentLoaded 已过
if (document.readyState !== 'loading') boot();