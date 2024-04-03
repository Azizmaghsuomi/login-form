let $ = document;

let registerForm = $.querySelector(".register-form");

const nameInput = $.querySelector(".name-input");
const passwordInput = $.querySelector(".password-input");
const emailInput = $.querySelector(".email-input");
const userTableElem = $.querySelector("table");

let db = null;
let objectStore = null;

window.addEventListener("load", () => {
  let DBOpenReq = indexedDB.open("AzizSite", 1);

  DBOpenReq.addEventListener("error", (err) => {
    console.warn("Error", err);
  });

  DBOpenReq.addEventListener("success", (event) => {
    db = event.target.result;
    getUsers();
    console.log("Success", event.target.result);
  });

  DBOpenReq.addEventListener("upgradeneeded", (event) => {
    db = event.target.result;

    console.log("Old V:", event.oldVersion);
    console.log("New V:", event.newVersion);

    if (!db.objectStoreNames.contains("users")) {
      objectStore = db.createObjectStore("users", {
        keyPath: "userID",
      });
    }

    if (db.objectStoreNames.contains("curse")) {
      db.deleteObjectStore("curse");
    }

    // db.createObjectStore('courses')

    console.log("upgrade", db.objectStoreNames);
  });
});

registerForm.addEventListener("submit", (event) => {
  event.preventDefault();

  let newUser = {
    userID: Math.floor(Math.random() * 9999),
    name: nameInput.value,
    password: passwordInput.value,
    email: emailInput.value,
  };

  let tx = creatTX("users", "readwrite");

  tx.addEventListener("complete", (event) => {
    console.log("Tx success", event);
  });

  let store = tx.objectStore("users");
  let requst = store.add(newUser);

  requst.addEventListener("error", (err) => {
    console.warn(" Requst Eroor", err);
  });

  requst.addEventListener("success", (event) => {
    console.log("Requst success", event);
    clearInputs();
    getUsers();
  });
});

function clearInputs() {
  nameInput.value = "";
  passwordInput.value = "";
  emailInput.value = "";
}

function getUsers() {
  let tx = creatTX("users", "readonly");

  tx.addEventListener("complete", (event) => {
    console.log("Tx success", event);
  });

  let store = tx.objectStore("users");
  let requst = store.getAll();

  requst.addEventListener("error", (err) => {
    console.warn("Get Requst Eroor", err);
  });

  requst.addEventListener("success", (event) => {
    let allUsers = event.target.result;

    userTableElem.innerHTML = `
            <tr>
               <th>ID</th>
               <th>Name</th>
               <th>Password</th>
               <th>Email</th>
               <th>Actions</th>
            </tr>`;

    userTableElem.innerHTML += allUsers
      .map((user) => {
        return `
        <tr>
          <td>1${user.userID}</td>
          <td>${user.name}</td>
          <td>${user.password}</td>
          <td>${user.email}</td>
          <th><a href="#" onclick="removeUser(${user.userID})" >Remove</a></th>     
      </tr>`;
      })
      .join("");

    // console.log(usersTemplateArray);
  });
}

function removeUser(userID) {
  event.preventDefault();

  console.log(userID);

  let tx = creatTX("users", "readwrite");
  tx.addEventListener("complete", (event) => {
    console.log('Delete TX' , event);
  });

  let store = tx.objectStore("users");
  let requst = store.delete(userID);

  requst.addEventListener("error", (err) => {
    console.warn("Delete Requst Eroor", err);
  });

  requst.addEventListener("success", (event) => {
    console.log("Delete Requst success", event);
    getUsers();
  });
}

function creatTX(storeName, mode) {
  let tx = db.transaction(storeName, mode);

  tx.addEventListener("error", (err) => {
    console.warn("Tx Eroor", err);
  });

  return tx;
}


//////////////////////////////////////////////


// برای حذف ذیتابیس
// const dbName = "AzizSite";

// // باز کردن یا ایجاد دیتابیس
// const request = indexedDB.deleteDatabase(dbName);

// // زمانی که درخواست حذف دیتابیس با موفقیت انجام شود
// request.onsuccess = function() {
//     console.log("دیتابیس با موفقیت حذف شد");
// };

// // زمانی که خطا در انجام درخواست رخ دهد
// request.onerror = function(event) {
//     console.error("خطا در حذف دیتابیس:", event.target.errorCode);
// };
