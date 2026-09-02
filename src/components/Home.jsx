
import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";

import { addEntry, updateEntry } from "../db";

function Home({entries, setEntries, products}){

    const location = useLocation();

    const editEntry = location.state?.editEntry;
    
    const today = new Date();

    const todayTotal = entries.filter(entry=> {
        const data = new Date(entry.time);

        return data.toDateString() === today.toDateString()
    }).reduce((total,entry)=>{
        return total + (entry.count * entry.price);
    },0)

    const [editing, setEditing] = useState(false);
    const [type, setType] = useState('')
    const [item, setItem] = useState('')
    const [price, setPrice] = useState('')
    const [count,setCount] = useState(1);
    const [entrySet, setEntrySet] = useState(0);
    const [showPopUp,setShowPopUp] = useState(false)
    
    
    useEffect(() => {
        if (editing) return;
    
        const product = products?.find(product => product.name === item);
    
        if (product) {
            setPrice(product.price);
        } else {
            setPrice("");
        }
    }, [item, editing, products]);
    
    useEffect(() => {
        if (editEntry) {
            setEditing(true);
    
            setItem(editEntry.name);
            setCount(editEntry.count);
            setPrice(editEntry.price);
    
            const product = products.find(
                product => product.name === editEntry.name
            );
    
            if (product) {
                setType(product.type);
            }
        }
    }, [editEntry]);
    
    useEffect(()=>{
        if(showPopUp)
            setTimeout(()=>{
                setShowPopUp(false)    
            },1000)
    },[showPopUp])
    
    const onSubmit = async(e)=>{
        e.preventDefault();
        if(editing){
    
            // updating
            await updateEntry({name: item, count: count, price: price, time: editEntry.time });
            setEntries(prev =>
                prev.map(entry =>
                    entry.time === editEntry.time
                        ? {
                            ...entry,
                            name: item,
                            count: count,
                            price: price
                        }
                        : entry
                )
            );
    
        }
        else{
    
    
            // adding new
    
            const entry={
                time: Date.now(), 
                name: item,
                count: count,
                price: price
            };
            await addEntry(entry);
            setEntries(prev=> [...prev,entry]);
            setEntrySet(prev=> prev + (entry.price*entry.count));
        }
        setType('')
        setItem('')
        setPrice('')
        setCount(1)
        setEditing(false)
        setShowPopUp(true)
        
    }


if (!products || products.length===0)
    return <main>
        <h1>Home</h1>
        <h2>No product listed</h2>
        <p>Please go to <Link to="/products">product page</Link> to add new product</p>
    </main>
else
    return(
            <main>
                <p className={`popup green ${showPopUp&&'show'}`}>Entry saved successfully</p>
                <h1>Home</h1>
                {products.length>0 && <h4>Today's total sale: {todayTotal} Rs.</h4>}
                <form onSubmit={onSubmit}>
                    <p>
                        <label htmlFor="type">Category:</label>
                        <select name="type" id="type"value={type} onChange={(e)=>setType(e.target.value)}>
                            <option value="" disabled={true}>select Category</option>
                            {
                                [...new Set(products?.map(product => product.type))].map(type => <option key={type} value={type}>{type}</option>)
                            }
                        </select>
                    </p>
                    
                    <p>
                        <label htmlFor="item">Product:</label>
                        <select name="item" id="item" disabled={!type} value={item} onChange={(e)=> setItem(e.target.value)}>
                            <option value="" disabled={true}>Select Product</option>
                            {
                                products?.filter(product=> product.type=== type).map(product => <option key={product.name} value={product.name}>{product.name}</option>)
                            }
                        </select>

                    </p>

                    <p>
                            <label htmlFor="count">Count:</label>
                            <input 
                                type="number" 
                                min={1} 
                                disabled={!item}
                                value={count} 
                                onChange={(e)=>setCount(e.target.value)} 
                            />
                    </p>
                    
                    <p>
                        <label htmlFor="price">price:</label>
                        <input
                            type="number"
                            min={0}
                            step={0.5}
                            name="price"
                            id="price"
                            disabled={!item}
                            value={price}
                            onChange={(e) => setPrice(Number(e.target.value))}
                        />
                    </p>
                    
                    <p>Item Total: {price*count}₹ <br/>   Grand Total: {entrySet}₹ <button type="button" className="reset" onClick={()=>setEntrySet(0)}>↺</button></p>
                    <button disabled={!price} type="submit">{editing?'Update':'Add'}</button>
                </form>
            </main>
) 
}
export default Home