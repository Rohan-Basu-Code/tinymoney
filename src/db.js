const DB_NAME = 'ShopDB';
const DB_VERSION = 1;


export function openDB(){
    return new Promise((resolve, reject)=>{
        const request = indexedDB.open(DB_NAME,DB_VERSION);

        request.onupgradeneeded = (event)=>{
            const db = event.target.result;


            if(!db.objectStoreNames.contains('products')){
                db.createObjectStore('products', {
                    keyPath: 'name'
                });
            }

            if(!db.objectStoreNames.contains('entries')){
                db.createObjectStore('entries', {
                    keyPath: 'time'
                });
            }
        }

        request.onsuccess = () => {
            resolve(request.result)
        };
        request.onerror = ()=>{
            reject(request.error)
        }

    })
}


export async function addProduct(product){
    const db = await openDB();

    return new Promise((resolve,reject) =>{
        const transaction = db.transaction('products','readwrite');
        const store = transaction.objectStore('products');
        const request  = store.add(product);
        request.onsuccess = () => {
            resolve(request.result);
        };
        request.onerror = () => {
            reject(request.error);
        };
    })
}

export async function getProduct(){
    const db = await openDB();

    return new Promise((resolve,reject) =>{
        const transaction = db.transaction('products','readonly');
        const store = transaction.objectStore('products');
        const request  = store.getAll();
        request.onsuccess = () => {
            resolve(request.result);
        };
        request.onerror = () => {
            reject(request.error);
        };
    })
}


export async function deleteProduct(name){
    const db = await openDB();

    return new Promise((resolve,reject) =>{
        const transaction = db.transaction('products','readwrite');
        const store = transaction.objectStore('products');
        const request  = store.delete(name);
        request.onsuccess = () => {
            resolve(request.result);
        };
        request.onerror = () => {
            reject(request.error);
        };
    })
}

export async function deleteAllProducts() {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction('products', 'readwrite');
        const store = transaction.objectStore('products');
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}


export async function addEntry(entry){
    const db = await openDB();

    return new Promise((resolve,reject) =>{
        const transaction = db.transaction('entries','readwrite');
        const store = transaction.objectStore('entries');
        const request  = store.add(entry);
        request.onsuccess = () => {
            resolve(request.result);
        };
        request.onerror = () => {
            reject(request.error);
        };
    })
}

export async function getEntries(){
    const db = await openDB();

    return new Promise((resolve,reject) =>{
        const transaction = db.transaction('entries','readonly');
        const store = transaction.objectStore('entries');
        const request  = store.getAll();
        request.onsuccess = () => {
            resolve(request.result);
        };
        request.onerror = () => {
            reject(request.error);
        };
    })
}

export async function deleteEntry(time){
    const db = await openDB();

    return new Promise((resolve,reject) =>{
        const transaction = db.transaction('entries','readwrite');
        const store = transaction.objectStore('entries');
        const request  = store.delete(time);
        request.onsuccess = () => {
            resolve(request.result);
        };
        request.onerror = () => {
            reject(request.error);
        };
    })
}

export async function updateEntry(entry){
    const db = await openDB();

    return new Promise((resolve,reject) =>{
        const transaction = db.transaction('entries','readwrite');
        const store = transaction.objectStore('entries');
        const request  = store.put(entry);
        request.onsuccess = () => {
            resolve(request.result);
        };
        request.onerror = () => {
            reject(request.error);
        };
    })
}

export async function deleteAllEntries() {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction('entries', 'readwrite');
        const store = transaction.objectStore('entries');
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}