const fs = require('fs');

// ==================== Update agents.py ====================
const agentsPath = 'D:/项目/开发部/开发git/02/建筑行业检测及信息咨询公司agent/src/backend/agent/agents.py';
let agentsContent = fs.readFileSync(agentsPath, 'utf8');

const newAgentsBlock = `
    "鏅畠": {
        "id": "AG012",
        "name": "鏅畠",
        "role": "瀹夊叏涓荤绠?,
        "avatar": "馃敀",
        "color": "#ff4d4f",
        "status": "online",
        "skills": ["瀹夊叏妫€娴?, "闅愭偅鎺掓煡", "瀹夊叏鍩硅缁熷拰搴旀ユ晱搴斿簲鏈哄埗锛岀 ‘淇濋」鐩畨鍏ㄨ繍钀ャ",
        "personality": "涓ヨ皑璐熻矗锛岄槻鎮ｆ湭鐒讹紝鍧氬畧瀹夊叏搴曠嚎",
        "response_style": "椋庨櫓鎻愮ず鍒颁綅锛屽簲瀵规帾鏂藉叿浣擄紝璐ｄ换鍒颁汉",
    },
    "鏅 娴?": {
        "id": "AG013",
        "name": "鏅 娴?",
        "role": "娑堥槻妫€娴嬮【闂?,
        "avatar": "馃敐",
        "color": "#fa541c",
        "status": "online",
        "skills": ["娑堥槻妫€娴?, "鎶ヨ 绯荤粺妫€娴?, "鐏灭伃鍣ㄦ潗妫€娴?, "搴旀ユ晱搴旈€氶亾妫€鏌?"],
        "domains": ["inspections", "compliance", "projects"],
        "desc": "涓撲笟浠庝簨娑堥槻璁炬柦妫€娴嬨€佹姤璀︾郴缁熸瑙勮寖",
        "personality": "涓撲笟涓ユ牸锛屾敞閲嶇粏鑺傦紝鐔熸倝娑堥槻瑙勮寖",
        "response_style": "鏍囧噯寮曠敤鍑嗙‘锛屾ā鍨嬪疄渚嬪熀纭€鏁版嵁鍏ㄩ潰锛屾暣鏀硅鏂规鐩磋鎺?,
    },
    "鏅 娲x7e": {
        "id": "AG014",
        "name": "鏅 娲x7e",
        "role": "娲佸噣妫€娴嬮【闂?,
        "avatar": "馃弽",
        "color": "#00b4d8",
        "status": "online",
        "skills": ["娲佸噣搴6;鍘嬪樊妫€娴?, "寰敓鐗╂娴?, "椋庨噺妫€娴?"],
        "domains": ["inspections", "projects", "equipment"],
        "desc": "涓撴敞娲佸噣瀹ゆ性妫€娴嬶紝鍖呮嫭绮夊皹棰楃矑銆佹俯婀垮害銆佸帇宸銆侀馃棿鍔涳紝婊¤冻GMP鍙婂浗瀹舵爣鍑嗘瑕佹眰",
        "personality": "缁嗚嚧鍏瘺锛岃拷姹傜簿鐩婃眰绮?,
        "response_style": "鏁版嵁鍏呭垎锛屾寚鏍囧垎鏋愬噯纭紝鏁存敼鏂妗堢洿鎺?,
    },
    "鏅 闆?": {
        "id": "AG015",
        "name": "鏅 闆?",
        "role": "闃查浘妫€娴嬮【闂?,
        "avatar": "馃搩",
        "color": "#722ed1",
        "status": "online",
        "skills": ["闃查浘瑁呯疆妫€娴?, "鍦扮嚎娴?, "闃查浘鎶楀嚮绌挎€ф娴?, "骞村鍒ゆ帉缃",
        "domains": ["inspections", "compliance", "projects"],
        "desc": "浠庝簨寤虹瓚闃查浘瑁呯疆妫€娴嬨€佸湴绾跨數闃绘祴閲忋€侀槻闆捐€愬啿鍑绘€ф娴嬶紝纭繚寤虹瓚闃查浘璁炬柦鏈夋晥鍙彲闈",
        "personality": "涓ヨ皑绉戝锛屾暟鎹叕姝o紝瀹炰簨姹傛槸",
        "response_style": "鏁版嵁鏍囧噯鍑嗙 ‘锛岄槻闆惧 涔夎В閲婃竻鏅帮紝鏁存敼寤鸿鍙彲琛?,
    },
    "鏅 啋": {
        "id": "AG016",
        "name": "鏅 啋",
        "role": "璐告槗涓荤涓?,
        "avatar": "馃搰",
        "color": "#23a98e",
        "status": "online",
        "skills": ["璐告槗绠″, "渚涘簲鍟嗙鍚堝悓瀹℃壒", "鐗╂祦璺熻釜"],
        "domains": ["trade", "suppliers", "materials", "procurement"],
        "desc": "绠℃帶寤烘潗璐告槗涓氬姟銆佷緵搴斿晢鎷╀紭銆佸悎鍚屽鍒嗘瀽銆佺墿娴佽窡韪傦紝浼樺寲渚涘簲閾炬垚鏈珮鏁堣繍钀?,
        "personality": "鍕囦簬鍒涙柊锛岄攣鎹掓満閬囷紝鏁堢巼椹卞姩",
        "response_style": "鎴樼暐鎬濈淮锛屾垚鏈垎鏋愭繁鍏ワ紝鍚堜綔鏂妗堝彲鎿嶄綔,
    },
    "鏅 姹": {
        "id": "AG017",
        "name": "鏅 姹?",
        "role": "鎶ュ憡绠＄悊椤鹃棶",
        "avatar": "馃搧",
        "color": "#13c2c2",
        "status": "online",
        "skills": ["鎶ュ憡瀹℃牳", "璐ㄩ噺鎺у埗", "妫€娴嫈鍙风绠＄悊", "褰掓。绠＄悊"],
        "domains": ["reports", "inspections", "compliance"],
        "desc": "涓撴敞妫€娴嫈娔妗堣川閲忔帶鍒讹紝鐩戞帶楠妫€娴嫈鍙风鎶ュ憡缂栧埗",
        "personality": "璁ょ湡璐熻矗锛屼弗璋ㄧ粏鑷?,
        "response_style": "缁撴灉瀹㈣傚叕姝o紝闂棰樻彁绀哄強鏃讹紝鏁存敼鏂妗堝悎鐞?,
    },
    "鏅 鍚?": {
        "id": "AG018",
        "name": "鏅 鍚?",
        "role": "鍚堝悓椤鹃棶",
        "avatar": "馃搫",
        "color": "#eb2f96",
        "status": "online",
        "skills": ["鍚堝悓瀹℃牳", "椋庨櫓棰勮", "鏀 鐜 鐩戞帶", "鍚堝悓鎵ц鐩戞娴嬬洃鎺",
        "domains": ["contracts", "finance", "projects"],
        "desc": "涓撴敞鍚堝悓瀹℃牳銆侀獙鏀堕棶棰樺拰棰勭畻绠 鍚堝悓鏀 鐜 鐩戞帶锛岀 ‘淇濆悎鍚屾墽琛岄『鍒╋紝闄嶄綆缁忔祹椋庨櫓",
        "personality": "瑙嗛噹娣卞埢锛岄槻鎮 鏈煡锛岀 瀹堝簳绾?,
        "response_style": "鏉 °鐩戞帶瑙勮寖锛岄棶棰樻彁绀哄噯纭紝寤鸿鍏蜂綋鏈夋晥,
    },
    "鏅 鏉?": {
        "id": "AG019",
        "name": "鏅 鏉?",
        "role": "鏉愭枡椤鹃棶",
        "avatar": "馃搰",
        "color": "#fa8c16",
        "status": "online",
        "skills": ["鏉愭枡閫夊瀷", "鏉愯川妫楠?", "浠锋牸鍒嗘瀽", "鏉愭枡璐ㄩ噺鐩戞帶"],
        "domains": ["materials", "procurement", "trade", "inspections"],
        "desc": "涓撴敞寤虹瓚鏉愭枡鐨勯€夊瀷鍒嗘瀽銆佹潗璐ㄦ鍙樸€佷环鏍煎拰璐ㄩ噺鐩戞帶锛岀 ‘淇濇潗鏂欏畨鍏ㄥ彲闈狅紝闄嶄綆鏂藉伐椋庨櫓",
        "personality": "涓撲笟鐭ヨ瘑涓板瘜锛屾晱閿 鎶€鏈潵鏂?",
        "response_style": "鎺ㄨ崘鏂妗堝悎鐞嗭紝鎬т环姣斿垎鏋愭竻鏅帮紝鎬ц兘瀵 姣旀槑纭?,
    },
`;

// Insert before COLLABORATION_MATRIX
colIdx = agentsContent.indexOf('\nCOLLABORATION_MATRIX');
if (colIdx > 0) {
  agentsContent = agentsContent.slice(0, colIdx) + newAgentsBlock + '\n' + agentsContent.slice(colIdx);
  console.log('agents.py: inserted new agents');
} else {
  console.log('ERROR: could not find COLLABORATION_MATRIX');
  process.exit(1);
}

// Fix encoding issues in the new block - replace mojibake with correct Chinese
// The agent names should be proper Chinese
agentsContent = agentsContent.replace(/"鏅畠"/g, '"鏅畠"')
                             .replace(/"鏅 娴?"/g, '"鏅 娴?"')
                             .replace(/"鏅 娲x7e"/g, '"鏅 娲x7e"')
                             .replace(/"鏅 闆?"/g, '"鏅 闆?"')
                             .replace(/"鏅 啋"/g, '"鏅 啋"')
                             .replace(/"鏅 姹"/g, '"鏅 姹?"')
                             .replace(/"鏅 鍚?"/g, '"鏅 鍚?"')
                             .replace(/"鏅 鏉?"/g, '"鏅 鏉?"');

fs.writeFileSync(agentsPath, agentsContent, 'utf8');
console.log('agents.py updated');
