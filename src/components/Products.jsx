import { useRef, useState, useEffect } from "react";
import {
    addProduct,
    deleteProduct,
    deleteAllProducts
} from "../db";


// FORMAT NAME / TYPE
const formatName = (value) => {
    return value
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, char => char.toUpperCase());
};


function Products({ products, setProducts }) {

    const MAX_TYPES = 12;

    // STATES
    const [actionMenu, setActionMenu] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    const [type, setType] = useState("");
    const [newType, setNewType] = useState("");

    const [name, setName] = useState("");
    const [price, setPrice] = useState(0);

    const [showView, setShowView] = useState(false);
    const [showPopUp,setShowPopUp] = useState(false)
    const [confirm, setConfirm] = useState(null);
    const [more,setMore] = useState(false);

    

    const longPressTimer = useRef(null);


    useEffect(()=>{
            if(showPopUp)
                setTimeout(()=>{
                    setShowPopUp(false)    
                },1000)
        },[showPopUp])


    // GET UNIQUE TYPES FROM PRODUCTS
    const types = [
        ...new Set(
            products.map(product => formatName(product.type))
        )
    ];
    // LONG PRESS
    const startLongPress = (name) => {

        setSelectedRow(name);

        longPressTimer.current = setTimeout(() => {
            setActionMenu(true);
        }, 600);
    };

    const cancelLongPress = () => {
        clearTimeout(longPressTimer.current);
    };

    // ADD PRODUCT
    const handleSubmit = async (e) => {
        e.preventDefault();

        // FORMAT PRODUCT NAME
        const finalName = formatName(name);

        if (!finalName) {
            return;
        }


        // CHECK DUPLICATE PRODUCT
        const nameExist = products.some(
            product =>
                formatName(product.name).toLowerCase() ===
                finalName.toLowerCase()
        );

        if (nameExist) {
            alert("Product with this name already exists");
            setName("");
            return;
        }

        // DETERMINE CATEGORY
        let finalType;

        if (type === "__new__") {

            finalType = formatName(newType);

            if (!finalType) {
                alert("Please enter a type");
                return;
            }

            // CHECK DUPLICATE TYPE
            const typeExists = types.some(
                existingType =>
                    formatName(existingType).toLowerCase() ===
                    finalType.toLowerCase()
            );

            if (typeExists) {
                alert("This type already exists");
                setNewType("");
                return;
            }

        } else {

            finalType = formatName(type);
        }

        // CREATE PRODUCT
        const newProd = {
            type: finalType,
            name: finalName,
            price: price
        };


        // SAVE
        try {

            await addProduct(newProd);

            setProducts(prev => [
                newProd,
                ...prev
            ]);

            setType("");
            setNewType("");
            setName("");
            setPrice(0);
            setShowPopUp(true)

        } catch (error) {

            console.error(
                "Failed to save product:",
                error
            );
        }
    };

    // DELETE PRODUCT
    const handleDelete = async () => {

        if (!selectedRow) return;


        try {

            await deleteProduct(selectedRow);


            setProducts(prev =>
                prev.filter(
                    product =>
                        product.name !== selectedRow
                )
            );


            setSelectedRow(null);
            setActionMenu(false);
            setShowPopUp(true)

        } catch (error) {

            console.error(
                "Failed to delete product:",
                error
            );
        }
    };

    // DELETE ALL
    const handleDeleteAll = async () => {

        try {

            await deleteAllProducts();

            setProducts([]);

            setSelectedRow(null);

            setActionMenu(false);

        } catch (error) {

            console.error(
                "Failed to delete all products:",
                error
            );
        }
    };

    // EXPORT
    const exportProducts = () => {

            const jsonData = JSON.stringify(products, null, 2);

            const blob = new Blob(
                [jsonData],
                { type: "application/json" }
            );

            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");

            a.href = url;
            a.download = `Products_${new Date().toLocaleDateString('en-GB',{ 
            month: 'short',
            year: 'numeric'
            })}.json`;

            a.click();

            URL.revokeObjectURL(url);
        };

    // IMPORT
    const importProducts = (e) => {
        const file = e.target.files[0];
        if(!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const importedProducts = JSON.parse(event.target.result); 

            const newProducts = importedProducts.filter(
                importedProduct=> {
                    return !products.some(prod =>
                        prod.name.toLowerCase() === importedProduct.name.toLowerCase()
                    )
                }

            )

            for (const product of newProducts) {
                await addProduct(product);
            }

            setProducts(prev => [
                ...newProducts,
                ...prev
            ]);
            alert(`Imported ${newProducts.length} products from the file.`)
        };
        reader.readAsText(file)

    };

    // KEYBOARD CONTROLS
    const handleKeyPress = async (e) => {

        if (products.length === 0) return;


        const currentIndex =
            products.findIndex(
                product =>
                    product.name === selectedRow
            );


        // ------------------------------
        // ARROW DOWN
        // ------------------------------

        if (e.key === "ArrowDown") {

            e.preventDefault();


            if (currentIndex === -1) {

                setSelectedRow(
                    products[0].name
                );

            } else if (
                currentIndex <
                products.length - 1
            ) {

                setSelectedRow(
                    products[currentIndex + 1].name
                );
            }
        }


        // ------------------------------
        // ARROW UP
        // ------------------------------

        if (e.key === "ArrowUp") {

            e.preventDefault();


            if (currentIndex === -1) {

                setSelectedRow(
                    products[products.length - 1].name
                );

            } else if (currentIndex > 0) {

                setSelectedRow(
                    products[currentIndex - 1].name
                );
            }
        }


        // ------------------------------
        // DELETE
        // ------------------------------

        if (e.key === "Delete") {

            e.preventDefault();

            if (!selectedRow) return;

            await handleDelete();
        }
    };

    // RENDER
    return (

        <main>

            <h1>Products</h1>


            <div className="prod-container">

                {/* HEADER */}
                <div className="prod-head">

                    <h3>

                        {!showView
                            ? "Add new product"
                            : "Products List"}

                    </h3>


                    <button
                        onClick={() =>
                            setShowView(prev => !prev)
                        }
                    >

                        {showView
                            ? "Add new product"
                            : "View products"}

                    </button>

                </div>


                {/* CONTENT */}
                <div className="prod-viewer">
                           

                    {showView ? (

                        // PRODUCT LIST
                        <div>
                             <button onClick={()=> setMore(prev => !prev)} className={`more ${more && 'active'}`}>More</button>
                            <div className={`more-window ${more && 'active'}`}>
                                
                                <button onClick={()=>{
                                    exportProducts()
                                    setMore(false)
                                }}
                                    disabled={
                                        products.length === 0
                                    }>
                                Export Products
                                </button>
                                <label>
                                    Import Products
                                    <input
                                        type="file"
                                        accept=".json"
                                        onChange={importProducts}
                                        onClick={()=>setMore(false)}
                                        hidden
                                    />
                                </label>
                                <button
                                    onClick={()=> {
                                        setConfirm('all')
                                        setMore(false)
                                    }}
                                    disabled={
                                        products.length === 0
                                    }
                                >
                                    Delete All Products
                                </button>
                            </div>
                            <div className="table-container">
                            <p className={`popup red ${showPopUp&&'show'}`}>Product removed successfully</p>

                            
                        
                            

                            <table
                                tabIndex={0}
                                onKeyDown={handleKeyPress}
                            >


                                <thead>

                                    <tr>

                                        <td>Category</td>

                                        <td>Name</td>

                                        <td>Price</td>

                                    </tr>

                                </thead>


                                <tbody>

                                    {products.map(prod => (

                                        <tr
                                            key={prod.name}

                                            onClick={() =>
                                                setSelectedRow(
                                                    prod.name
                                                )
                                            }

                                            onTouchStart={() =>
                                                startLongPress(
                                                    prod.name
                                                )
                                            }

                                            onTouchEnd={
                                                cancelLongPress
                                            }

                                            onTouchMove={
                                                cancelLongPress
                                            }

                                            className={
                                                selectedRow ===
                                                prod.name
                                                    ? "selected"
                                                    : ""
                                            }
                                        >

                                            <td>
                                                {formatName(
                                                    prod.type
                                                )}
                                            </td>

                                            <td>
                                                {formatName(
                                                    prod.name
                                                )}
                                            </td>

                                            <td>
                                                {prod.price} /-
                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>


                            {/* ACTION MENU */}
                            {actionMenu && (

                                <div
                                    className="action-menu"

                                    onClick={() =>
                                        setActionMenu(false)
                                    }
                                >

                                    <div>


                                        <button
                                            onClick={(e) => {

                                                e.stopPropagation();

                                                setConfirm(()=>handleDelete)

                                            }}
                                        >
                                            Delete
                                        </button>


                                        <button
                                            onClick={() =>
                                                setActionMenu(false)
                                            }
                                        >
                                            Cancel
                                        </button>


                                    </div>

                                </div>

                            )}
                            {/* CONFIRM MENU */}
                            {
                                    confirm && (
                                        <div className="action-menu">
                                            <div>
                                                {confirm === 'all'
                                                ?(<>
                                                <p>Are you sure you want to delete all products?</p>
                                                <p>This process is <strong>irriversable</strong>.</p>
                                                <p>Please make sure to <strong>Export</strong> the data first.</p>
                                                <button
                                                
                                                className="red" 
                                                onClick={async ()=>{
                                                    await handleDeleteAll();
                                                    setProducts([]);
                                                    setSelectedRow(null)
                                                    setConfirm(null);
                                                }}>Confirm
                                                </button>
                                                </>)
                                                :(<>
                                                <p>Are you sure you want to delete this Product?</p>
                                                <p>
                                                    <span>{products.find(prod => prod.name === selectedRow)?.name}</span>
                                                    <span>({products.find(prod => prod.name === selectedRow)?.type}) --------- </span>
                                                    <span>{products.find(prod => prod.name === selectedRow)?.price} /-</span>
                                                </p>
                                                <button
                                                
                                                className="red" 
                                                onClick={async ()=>{
                                                    handleDelete()
                                                    setActionMenu(false)
                                                    setSelectedRow(null)
                                                    setConfirm(null);
                                                }}>Confirm
                                                </button>
                                                </>)}
                                                
                            
                            
                                                <button onClick={()=> setConfirm(null)}>Cancel</button>
                                            </div>
                                            
                                        </div>
                                    )
                                }

                            </div>
                        </div>
                        


                    ) : (

                        // ADD PRODUCT FORM
                        <div>
                            <p className={`popup green ${showPopUp&&'show'}`}>Product saved successfully</p>
                            <form
                                onSubmit={handleSubmit}
                            >



                                {/* PRODUCT NAME */}
                                <p>

                                    <label htmlFor="name">
                                        Name:
                                    </label>


                                    <input
                                        name="name"
                                        id="name"
                                        type="text"
                                        value={name}
                                        required
                                        onChange={(e) =>
                                            setName(
                                                e.target.value
                                            )
                                        }
                                    />

                                </p>
            
                                {/* CATEGORY */}
                                <p>
                                    <label htmlFor="type">
                                        Category ({types.length}/{MAX_TYPES}):
                                    </label>

                                    <select
                                    disabled = {!name}
                                        required
                                        name="type"
                                        id="type"
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                    >
                                        <option value="" disabled>
                                            Select Category
                                        </option>

                                        {types.map(type => (
                                            <option
                                                key={type}
                                                value={type}
                                            >
                                                {type}
                                            </option>
                                        ))}

                                        {types.length < MAX_TYPES && (
                                            <option value="__new__">
                                                + New Category
                                            </option>
                                        )}
                                    </select>
                                </p>

                                {/* NEW CATEGORY */}
                                {type === "__new__" && (
                                    <p>
                                        <label htmlFor="newType">
                                            New Category:
                                        </label>

                                        <input
                                            id="newType"
                                            type="text"
                                            value={newType}
                                            onChange={(e) =>
                                                setNewType(e.target.value)
                                            }
                                            placeholder="Enter Category"
                                            required
                                            disabled={!name}
                                        />
                                    </p>
                                )}

                                {/* PRICE */}
                                <p>

                                    <label htmlFor="price">
                                        Price:
                                    </label>

                                    <input
                                        name="price"
                                        id="price"
                                        type="number"
                                        step={0.5}
                                        min={0.5}
                                        value={price}
                                        required
                                        disabled={!type}
                                        onChange={(e) =>
                                            setPrice(
                                                Number(
                                                    e.target.value
                                                )
                                            )
                                        }
                                    />

                                </p>

                                {/* ADD BUTTON */}
                                <button
                                    disabled={
                                        !type ||
                                        (type === "__new__" &&
                                            newType.trim() === "") ||
                                        name.trim() === "" ||
                                        !price
                                    }

                                    type="submit"
                                >
                                    Add
                                </button>

                            </form>
                         </div>       
                    )}

                </div>

            </div>

        </main>
    );
}


export default Products;