// Firebase 初始化（使用 compat 版本）
const firebaseConfig = {
    apiKey: "AIzaSyCMb901QdXF-GdDspcr3uNwC4rg07ebOHM",
    authDomain: "lspd-5b29d.firebaseapp.com",
    databaseURL: "https://lspd-5b29d-default-rtdb.firebaseio.com/", // 這裡請改成你的真實 URL
    projectId: "lspd-5b29d",
    storageBucket: "lspd-5b29d.appspot.com",
    messagingSenderId: "643905363361",
    appId: "1:643905363361:web:400543d08fed091c967fe0"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const accounts = [
    { user: "nokia", pass: "870928", name: "諾起亞局長" },
    { user: "xiagg", pass: "000000", name: "夏果警探" },
    { user: "zerooo", pass: "092318NY", name: "哈維·哈特曼警督" },
    { user: "Lei477", pass: "000477", name: "鐳褒警督" },
    { user: "arthur", pass: "000000", name: "湯姆·霍蘭德副局長" },
    { user: "noe0101", pass: "422000", name: "言諾諾警探" },
    { user: "nickwu", pass: "666999", name: "李永順警探" },
    { user: "tess", pass: "300635", name: "泰絲警探" }
];

const detectiveProfiles = {
    "諾起亞局長": { name: "諾起亞·依林", birth: "女", sign: "428", rank: "局長", department: "警探組", photo: "nokia.png" },
    "夏果警探": { name: "夏果", birth: "女", sign: "410", rank: "資深探員", department: "警探組", photo: "https://media.discordapp.net/attachments/843799477360918549/1395764409111941151/image.png?ex=687ba267&is=687a50e7&hm=17a4807fb62951004bc63a1d519e084898e54f2faf7d39b984be7c09977aaa82&=&format=webp&quality=lossless" },
    "湯姆·霍蘭德副局長": { name: "湯姆·霍蘭德", birth: "男", sign: "444", rank: "副局長", department: "警探組", photo: "https://media.discordapp.net/attachments/843799477360918549/1395759625692778699/image.png?ex=687b9df2&is=687a4c72&hm=5355f6bac8250d855483372be40b2207a493835ce4082aead2ec34e7b584be84&=&format=webp&quality=lossless&width=722&height=960" },
    "哈維·哈特曼警督": { name: "哈維·哈特曼", birth: "男", sign: "404", rank: "二級警督", department: "警探組", photo: "https://media.discordapp.net/attachments/843799477360918549/1395761584885993533/image.png?ex=687b9fc5&is=687a4e45&hm=95a09842b92f3e1fa9171e5a2ad5f0972b7fa3cf695c42c282bf17c8b59a97f5&=&format=webp&quality=lossless" },
    "鐳褒警督": { name: "鐳褒", birth: "男", sign: "477", rank: "二級警督", department: "警探組", photo: "apple.png" },
    "言諾諾警探": { name: "言諾諾", birth: "女", sign: "422", rank: "現場分析員", department: "警探組", photo: "apple.png" },
    "李永順警探": { name: "李永順", birth: "男", sign: "469", rank: "現場分析員", department: "警探組", photo: "apple.png" },
    "泰絲警探": { name: "泰絲•奎因", birth: "女", sign: "401", rank: "資深探員", department: "警探組", photo: "https://media.discordapp.net/attachments/843799477360918549/1395760779155738686/image.png?ex=687b9f05&is=687a4d85&hm=52adce8695288a17e60f1895e70a94aefdc695a40d6961a12ec60ba98ffc5921&=&format=webp&quality=lossless" }
};

let currentDetective = "";
let cases = [];
let currentEditingIndex = null;

function login() {
    const user = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").value.trim();
    const found = accounts.find(acc => acc.user === user && acc.pass === pass);
    if (found) {
        currentDetective = found.name;
        document.getElementById("loginPage").style.display = "none";
        document.getElementById("loadingScreen").style.display = "flex";
        let progress = 0;
        const fill = document.getElementById("progressFill");
        const interval = setInterval(() => {
            progress += 5;
            fill.style.width = `${progress}%`;
            if (progress >= 100) {
                clearInterval(interval);
                loadCasesFromFirebase();
            }
        }, 100);
    } else {
        alert("帳號或密碼錯誤！");
    }
}

function logout() {
    if (confirm("確定登出？")) {
        currentDetective = "";
        cases = [];
        currentEditingIndex = null;
        document.getElementById("mainPage").style.display = "none";
        document.getElementById("loginPage").style.display = "block";
        document.getElementById("caseList").innerHTML = "";
        clearForm();
    }
}

function clearForm() {
    document.getElementById("caseTitle").value = "";
    document.getElementById("caseDate").value = "";
    document.getElementById("caseTime").value = "";
    document.getElementById("caseDetective").value = "";
    document.getElementById("caseContent").value = "";
    document.getElementById("caseImage").value = "";
}

function addCase() {
    const title = document.getElementById("caseTitle").value.trim();
    const date = document.getElementById("caseDate").value.trim();
    const time = document.getElementById("caseTime").value.trim();
    const detective = document.getElementById("caseDetective").value.trim();
    const content = document.getElementById("caseContent").value.trim();
    const imageInput = document.getElementById("caseImage");
    const imageFile = imageInput.files[0];

    if (!title || !date || !time || !detective || !content) {
        alert("請完整填寫所有欄位！");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const newCase = {
            title,
            date,
            time,
            detective,
            content,
            image: imageFile ? e.target.result : "",
            createdBy: currentDetective,
            timestamp: Date.now()
        };
        saveCaseToFirebase(newCase);
    };
    if (imageFile) {
        reader.readAsDataURL(imageFile);
    } else {
        reader.onload({ target: { result: "" } });
    }
}

function saveCaseToFirebase(newCase) {
    // 先取得目前案件數量
    db.ref('cases').once('value').then(snapshot => {
        const count = snapshot.numChildren();  // 目前案件數量
        const newId = '' + (count + 1);     // 生成下一個 ID，比如 ID1、ID2...

        db.ref('cases/' + newId).set(newCase, (error) => {
            if (error) {
                alert("新增案件失敗：" + error.message);
            } else {
                loadCasesFromFirebase();
                clearForm();
            }
        });
    }).catch(error => {
        alert("無法取得案件數量：" + error.message);
    });
}


function loadCasesFromFirebase() {
    const caseList = document.getElementById("caseList");
    caseList.innerHTML = "";
    document.getElementById("loadingScreen").style.display = "flex";
    db.ref('cases').orderByChild('timestamp').once('value', snapshot => {
        cases = [];
        snapshot.forEach(childSnapshot => {
            const key = childSnapshot.key;
            const data = childSnapshot.val();
            cases.push({ id: key, ...data });
        });
        cases.sort((a, b) => b.timestamp - a.timestamp);
        displayCases();
        document.getElementById("loadingScreen").style.display = "none";
        document.getElementById("mainPage").style.display = "block";
        document.getElementById("detectiveName").innerText = currentDetective;
    }).catch(error => {
        alert("讀取案件資料失敗：" + error.message);
        document.getElementById("loadingScreen").style.display = "none";
        document.getElementById("mainPage").style.display = "block";
    });
}

function displayCases() {
    const caseList = document.getElementById("caseList");
    caseList.innerHTML = "";
    cases.forEach((item, index) => {
        const previewText = item.content.length > 50 ? item.content.slice(0, 50) + "..." : item.content;
        const caseItemDiv = document.createElement("div");
        caseItemDiv.className = "case-item";
        caseItemDiv.innerHTML = `
        <h3>ID ${item.id} - ${item.title}</h3>
        <p><strong>預覽：</strong>${previewText}</p>
      `;
        caseItemDiv.onclick = function () {
            showCaseDetail(index);
        };
        caseList.appendChild(caseItemDiv);
    });
}

function showCaseDetail(index) {
    currentEditingIndex = index;
    const caseItem = cases[index];
    const caseDetailPage = document.getElementById("caseDetailPage");
    caseDetailPage.innerHTML = `
      <h2>編輯案件 ID ${caseItem.id}</h2>
      <label>案件標題：</label>
      <input type="text" id="editCaseTitle" value="${caseItem.title}" />
      <label>日期 (YYYY/MM/DD)：</label>
      <input type="text" id="editCaseDate" value="${caseItem.date}" />
      <label>時間 (HH:MM)：</label>
      <input type="text" id="editCaseTime" value="${caseItem.time}" />
      <label>調查警探：</label>
      <input type="text" id="editCaseDetective" value="${caseItem.detective}" />
      <label>案件內容：</label>
      <textarea id="editCaseContent" rows="5">${caseItem.content}</textarea>
      <label>更換圖片：</label>
      <input type="file" id="editCaseImage" accept="image/*" />
      ${caseItem.image ? `<img src="${caseItem.image}" class="case-image" alt="案件圖片" />` : ""}
      <br/>
      <button onclick="saveEditedCase()">儲存修改</button>
      <button onclick="deleteCase()">刪除案件</button>
      <button onclick="closeCaseDetail()">返回列表</button>
    `;
    caseDetailPage.style.display = "block";
    document.getElementById("mainPage").style.display = "none";
}

function saveEditedCase() {
    if (currentEditingIndex === null) return;
    const caseItem = cases[currentEditingIndex];

    const newTitle = document.getElementById("editCaseTitle").value.trim();
    const newDate = document.getElementById("editCaseDate").value.trim();
    const newTime = document.getElementById("editCaseTime").value.trim();
    const newDetective = document.getElementById("editCaseDetective").value.trim();
    const newContent = document.getElementById("editCaseContent").value.trim();
    const newImageInput = document.getElementById("editCaseImage");
    const newImageFile = newImageInput.files[0];

    if (!newTitle || !newDate || !newTime || !newDetective || !newContent) {
        alert("請完整填寫所有欄位！");
        return;
    }

    function updateFirebaseCase(imageData) {
        const updatedCase = {
            title: newTitle,
            date: newDate,
            time: newTime,
            detective: newDetective,
            content: newContent,
            image: imageData !== undefined ? imageData : caseItem.image,
            createdBy: caseItem.createdBy,
            timestamp: caseItem.timestamp
        };
        db.ref('cases/' + caseItem.id).set(updatedCase, error => {
            if (error) {
                alert("更新案件失敗：" + error.message);
            } else {
                loadCasesFromFirebase();
                closeCaseDetail();
            }
        });
    }

    if (newImageFile) {
        const reader = new FileReader();
        reader.onload = function (e) {
            updateFirebaseCase(e.target.result);
        };
        reader.readAsDataURL(newImageFile);
    } else {
        updateFirebaseCase();
    }
}

function deleteCase() {
    if (currentEditingIndex === null) return;
    const caseItem = cases[currentEditingIndex];
    if (confirm("確定要刪除此案件？")) {
        db.ref('cases/' + caseItem.id).remove(error => {
            if (error) {
                alert("刪除案件失敗：" + error.message);
            } else {
                loadCasesFromFirebase();
                closeCaseDetail();
            }
        });
    }
}

function closeCaseDetail() {
    document.getElementById("caseDetailPage").style.display = "none";
    document.getElementById("mainPage").style.display = "block";
    currentEditingIndex = null;
}

function searchCases() {
    const searchText = document.getElementById("searchInput").value.trim().toLowerCase();
    const caseList = document.getElementById("caseList");
    caseList.innerHTML = "";
    cases.forEach((item, index) => {
        const combinedText = (item.title + item.content + item.detective + item.date + item.time).toLowerCase();
        if (combinedText.includes(searchText)) {
            const previewText = item.content.length > 50 ? item.content.slice(0, 50) + "..." : item.content;
            const caseItemDiv = document.createElement("div");
            caseItemDiv.className = "case-item";
            caseItemDiv.innerHTML = `
          <h3>ID ${item.id} - ${item.title}</h3>
          <p><strong>預覽：</strong>${previewText}</p>
        `;
            caseItemDiv.onclick = function () {
                showCaseDetail(index);
            };
            caseList.appendChild(caseItemDiv);
        }
    });
}

function showProfile() {
    document.getElementById("mainPage").style.display = "none";
    document.getElementById("caseDetailPage").style.display = "none";
    document.getElementById("profilePage").style.display = "block";
    document.getElementById("certPage").style.display = "none";
    const profile = detectiveProfiles[currentDetective];
    const profileContent = document.getElementById("profileContent");
    if (profile) {
        profileContent.innerHTML = `
      <img src="${profile.photo}" alt="警探照片" style="max-width: 300px; border-radius: 8px;" />
        <h2>${profile.name}</h2>
        <p>性別：${profile.birth}</p>
        <p>警號：${profile.sign}</p>
        <p>職級：${profile.rank}</p>
        <p>部門：${profile.department}</p>
      `;
    } else {
        profileContent.innerHTML = "<p>找不到個人資料。</p>";
    }
}

function showCertificates() {
    document.getElementById("mainPage").style.display = "none";
    document.getElementById("caseDetailPage").style.display = "none";
    document.getElementById("profilePage").style.display = "none";
    document.getElementById("certPage").style.display = "block";
    const certContent = document.getElementById("certContent");
    certContent.innerHTML = "";
    if (currentDetective === "諾起亞局長") {
        certContent.innerHTML = `
        <img src="cert1.jpg" alt="資格證1" />
        <img src="cert2.jpg" alt="資格證2" />
        <img src="cert3.jpg" alt="資格證3" />
      `;
    } else {
        certContent.innerHTML = "<p>無資格證資料</p>";
    }
}


function backToMain() {
    document.getElementById("mainPage").style.display = "block";
    document.getElementById("caseDetailPage").style.display = "none";
    document.getElementById("profilePage").style.display = "none";
    document.getElementById("certPage").style.display = "none";
}