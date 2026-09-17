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

            // Discount entry
            if (entry.type === "discount") {
                return total + Number(entry.price);
            }

            // Normal sale entry
            return total + (
                Number(entry.count) * Number(entry.price)
            );

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
     * Get product price automatically
     * when a product is selected.
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
     * Load entry when editing.
     */
    useEffect(() => {

        if (editEntry) {

            setEditing(true);

            setItem(editEntry.name);

            setCount(editEntry.count);

            setPrice(editEntry.price);

            const product = products?.find(
                product => product.name === editEntry.name
            );

            if (product) {
                setType(product.type);
            }
        }

    }, [editEntry, products]);


    /*
     * Success popup.
     */
    useEffect(() => {

        if (showPopUp) {

            setTimeout(() => {
                setShowPopUp(false);
            }, 1000);

        }

    }, [showPopUp]);


    /*
     * Add / update product entry.
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
                price: Number(price)
            };

            await addEntry(entry);

            setEntries(prev => [
                ...prev,
                entry
            ]);

            setEntrySet(prev =>
                prev + (
                    Number(entry.price) *
                    Number(entry.count)
                )
            );
        }


        setType('');

        setItem('');

        setPrice('');

        setCount(1);

        setEditing(false);

        setShowPopUp(true);
    };


    /*
     * End current transaction.
     *
     * The discount is stored as a negative
     * price/rate entry.
     */
    const resetSale = async () => {

        const discountAmount = Number(discount);

        if (discountAmount > 0) {

            const discountEntry = {
                time: Date.now(),
                type: "discount",
                name: "",
                count: 0,
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


    /*
     * Final amount after discount.
     */
    const finalTotal =
        entrySet - Number(discount);


    /*
     * Discount must be:
     *
     * 0 or greater
     * less than Grand Total
     */
    const discountIsValid =
        Number(discount) >= 0 &&
        Number(discount) < entrySet;


    /*
     * No products available.
     */
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


                {/* PRICE */}

                <p>

                    <label htmlFor="price">
                        Price:
                    </label>

                    <input
                        type="number"
                        min={0}
                        step={0.5}
                        name="price"
                        id="price"
                        disabled={!item}
                        value={price}
                        onChange={(e) =>
                            setPrice(Number(e.target.value))
                        }
                    />

                </p>


                {/* ITEM TOTAL */}

                <p>
                    Item Total:{" "}
                    {(
                        Number(price) *
                        Number(count)
                    ) || 0}₹
                </p>


                {/* ADD */}

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
                        step={0.5}
                        id="discount"
                        value={discount}
                        disabled={entrySet === 0}
                        onChange={(e) =>
                            setDiscount(e.target.value)
                        }
                    />

                </p>


                {/* TOTALS */}

                <p>

                    Grand Total: {entrySet}₹

                    <br />

                    Final Total: {finalTotal}₹

                </p>


                {/* END SALE */}

                <button
                    type="button"
                    className="reset"
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