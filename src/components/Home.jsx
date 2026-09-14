import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";

import { addEntry, updateEntry } from "../db";

function Home({ entries, setEntries, products }) {

    const location = useLocation();

    const editEntry = location.state?.editEntry;

    const today = new Date();

    const todayTotal = entries
        .filter(entry => {
            const data = new Date(entry.time);

            return data.toDateString() === today.toDateString();
        })
        .reduce((total, entry) => {

            // Discount entries already contain a negative price
            if (entry.type === "discount") {
                return total + Number(entry.price);
            }

            return total + (Number(entry.count) * Number(entry.price));

        }, 0);


    const [editing, setEditing] = useState(false);
    const [type, setType] = useState('');
    const [item, setItem] = useState('');
    const [price, setPrice] = useState('');
    const [count, setCount] = useState(1);

    const [entrySet, setEntrySet] = useState(0);
    const [discount, setDiscount] = useState(0);

    const [showPopUp, setShowPopUp] = useState(false);


    /*
     * Get price automatically from selected product
     */
    useEffect(() => {

        if (editing) return;

        const product = products?.find(
            product => product.name === item
        );

        if (product) {
            setPrice(product.price);
        } else {
            setPrice("");
        }

    }, [item, editing, products]);


    /*
     * Load entry when editing
     */
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

    }, [editEntry, products]);


    /*
     * Popup
     */
    useEffect(() => {

        if (showPopUp) {
            setTimeout(() => {
                setShowPopUp(false);
            }, 1000);
        }

    }, [showPopUp]);


    /*
     * Add / update product entry
     */
    const onSubmit = async (e) => {

        e.preventDefault();

        if (editing) {

            // Updating existing entry

            await updateEntry({
                name: item,
                count: Number(count),
                price: Number(price),
                time: editEntry.time
            });

            setEntries(prev =>
                prev.map(entry =>
                    entry.time === editEntry.time
                        ? {
                            ...entry,
                            name: item,
                            count: Number(count),
                            price: Number(price)
                        }
                        : entry
                )
            );

        } else {

            // Adding new entry

            const product = products.find(
                product => product.name === item
            );

            if (!product) return;

            const entry = {
                time: Date.now(),
                name: item,
                count: Number(count),
                price: Number(product.price)
            };

            await addEntry(entry);

            setEntries(prev => [
                ...prev,
                entry
            ]);

            setEntrySet(prev =>
                prev + (entry.price * entry.count)
            );
        }

        setType('');
        setItem('Discount');
        setPrice('');
        setCount(1);
        setEditing(false);

        setShowPopUp(true);
    };


    /*
     * End current transaction
     *
     * Discount is saved as a negative price/rate.
     */
    const resetSale = async () => {

        const discountAmount = Number(discount);

        if (discountAmount > 0) {

            const discountEntry = {
                time: Date.now(),
                type: "discount",
                name: "Discount",
                count: 1,
                price: -discountAmount
            };

            await addEntry(discountEntry);

            setEntries(prev => [
                ...prev,
                discountEntry
            ]);
        }

        setEntrySet(0);
        setDiscount(0);
    };


    const finalTotal =
        entrySet - Number(discount);


    const discountIsValid =
        Number(discount) >= 0 &&
        Number(discount) < entrySet;


    if (!products || products.length === 0) {

        return (
            <main>

                <h1>Home</h1>

                <h2>No product listed</h2>

                <p>
                    Please go to{" "}
                    <Link to="/products">
                        product page
                    </Link>{" "}
                    to add new product
                </p>

            </main>
        );
    }


    return (
        <main>

            <p className={`popup green ${showPopUp && 'show'}`}>
                Entry saved successfully
            </p>

            <h1>Home</h1>

            <h4>
                Today's total sale: {todayTotal} Rs.
            </h4>


            <form onSubmit={onSubmit}>

                {/* CATEGORY */}

                <p>

                    <label htmlFor="type">
                        Category:
                    </label>

                    <select
                        name="type"
                        id="type"
                        value={type}
                        onChange={(e) =>
                            setType(e.target.value)
                        }
                    >

                        <option
                            value=""
                            disabled
                        >
                            Select Category
                        </option>

                        {
                            [
                                ...new Set(
                                    products.map(
                                        product => product.type
                                    )
                                )
                            ].map(type => (

                                <option
                                    key={type}
                                    value={type}
                                >
                                    {type}
                                </option>

                            ))
                        }

                    </select>

                </p>


                {/* PRODUCT */}

                <p>

                    <label htmlFor="item">
                        Product:
                    </label>

                    <select
                        name="item"
                        id="item"
                        disabled={!type}
                        value={item}
                        onChange={(e) =>
                            setItem(e.target.value)
                        }
                    >

                        <option
                            value=""
                            disabled
                        >
                            Select Product
                        </option>

                        {
                            products
                                .filter(
                                    product =>
                                        product.type === type
                                )
                                .map(product => (

                                    <option
                                        key={product.name}
                                        value={product.name}
                                    >
                                        {product.name} ({product.price}/-)
                                    </option>

                                ))
                        }

                    </select>

                </p>


                {/* COUNT */}

                <p>

                    <label htmlFor="count">
                        Count:
                    </label>

                    <input
                        type="number"
                        min={1}
                        disabled={!item}
                        value={count}
                        onChange={(e) =>
                            setCount(e.target.value)
                        }
                    />

                </p>


                {/* ITEM TOTAL */}

                <p>
                    Item Total:{" "}
                    {(Number(price) * Number(count)) || 0}₹
                </p>


                {/* ADD / UPDATE */}

                <button
                    disabled={!price}
                    type="submit"
                >
                    {editing ? 'Update' : 'Add'}
                </button>


                {/* DISCOUNT */}

                <p>

                    <label htmlFor="discount">
                        Discount:
                    </label>

                    <input
                        type="number"
                        min={0}
                        step={1}
                        id="discount"
                        value={discount}
                        disabled={entrySet === 0}
                        onChange={(e) =>
                            setDiscount(e.target.value)
                        }
                    />

                </p>


                {/* TOTAL */}

                <p>

                    Grand Total: {entrySet}₹
                    <br />

                    Final Price: {finalTotal}₹

                </p>


                {/* END SALE */}

                <button
                    type="button"
                    onClick={resetSale}
                    disabled={
                        entrySet === 0 ||
                        !discountIsValid
                    }
                >
                    End Sale ↺
                </button>

            </form>

        </main>
    );
}

export default Home;