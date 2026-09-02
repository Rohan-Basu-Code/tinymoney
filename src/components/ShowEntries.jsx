import { useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import * as XLSX from "xlsx";

import { deleteEntry, deleteAllEntries } from "../db";
function ShowEntries({entries, setEntries}) {

    const [selectedRow, setSelectedRow]=useState(null)
    
    const [actionMenu, setActionMenu] = useState(false);
    const [confirm, setConfirm] = useState(null);
    const [more,setMore] = useState(false);
    const [filter,setFilter] = useState(false);

    const [filterName, setFilterName] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");



    const longPressTimer = useRef(null);
    const navigate = useNavigate();

    const startLongPress = (time) => {
        setSelectedRow(time);

        longPressTimer.current = setTimeout(() => {
            setActionMenu(true);
        }, 600);
    };

    const handleDelete = async (selectedRow)=>{
        if (!selectedRow) return;

            await deleteEntry(selectedRow);

            setEntries(prev =>
                prev.filter(entry => entry.time !== selectedRow)
            );

        setSelectedRow(null);
        setActionMenu(false);
    }

    const handleEdit = async (selectedRow) => {
        const entry = entries.find(entry=> entry.time===selectedRow);

        if(entry) {
            navigate('/',{
                state: {
                    editEntry:entry
                }
            })
        }
    }

    const cancelLongPress = () => {
        clearTimeout(longPressTimer.current);
    };

    const handleKeyPress = async(e)=>{
        if (entries.length===0) return;

        const currentIndex = entries.findIndex(entry=>entry.time=== selectedRow);

        if(e.key === 'ArrowDown'){
            e.preventDefault();
            
            if(currentIndex===-1){
                setSelectedRow(entries[0].time)
            }
            else if(currentIndex < entries.length -1){
                setSelectedRow(entries[currentIndex+1].time)
            }
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();

            if (currentIndex === -1) {
                setSelectedRow(entries[entries.length - 1].time);
            } else if (currentIndex > 0) {
                setSelectedRow(entries[currentIndex - 1].time);
            }
        }

        if (e.key === "Delete") {
            e.preventDefault();
            setConfirm(()=>handleDelete)
        }

        if (e.key === "Enter") {
            e.preventDefault();
            handleEdit(selectedRow)
        }
    }

    const exportToExcel = () => {
        const data = filteredEntries.map(entry => ({
            Product: entry.name,
            Quantity: entry.count,
            "Selling Price": entry.price,
            Total: entry.count * entry.price,
            Date: new Date(entry.time)
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        filteredEntries.forEach((_, index) => {
            const cell = worksheet[`E${index + 2}`];

            if (cell) {
                cell.z = "dd/mm/yy";
            }
        });
        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Sales"
        );


        // all logic is for naming

        XLSX.writeFile(
    workbook,
    `Shop_Sales${
        filterName
            ? `_filtered_${filterName}`
            : fromDate && toDate
                ? `_filtered_${new Date(fromDate).toLocaleDateString('en-GB')} to ${new Date(toDate).toLocaleDateString('en-GB')}`
                : fromDate
                    ? `_filtered_${new Date(fromDate).toLocaleDateString('en-GB')}`
                    : toDate
                        ? `_filtered_${new Date(toDate).toLocaleDateString('en-GB')}`
                        : `_${new Date(filteredEntries[0].time).toLocaleDateString('en-GB')} to ${new Date(filteredEntries[filteredEntries.length - 1].time).toLocaleDateString('en-GB')}`
    }.xlsx`
);
    };

    const filteredEntries = entries.filter(entry => {

        const matchesName =
            !filterName ||
            entry.name.toLowerCase().includes(
                filterName.toLowerCase()
            );

        const entryDate = new Date(entry.time);

        const matchesFrom =
            !fromDate ||
            entryDate >= new Date(`${fromDate}T00:00:00`);

        const matchesTo =
            !toDate ||
            entryDate <= new Date(`${toDate}T23:59:59`);

        return matchesName && matchesFrom && matchesTo;
    });

return(
    <main>
     <h1>Entries</h1> 
     {entries.length>0?
     (
        <div className="entries-container">
            <button onClick={()=> setMore(prev => !prev)} className={`more ${more && 'active'}`}>More</button>
            <div className={`more-window ${more && 'active'}`}>
                
                <button
                    onClick={()=>{
                        exportToExcel()
                        setMore(false)
                    }}
                    disabled={entries.length === 0}
                >
                    Export to Excel
                </button>
                <button onClick={()=>{
                    setConfirm(() => deleteAllEntries)
                    setMore(false)
                }}
                disabled={entries.length===0}>
                Delete All Entries
                </button>
            </div>
            <button onClick={()=> setFilter(prev => !prev)} className={`more ${filter && 'active'}`}>Filter</button>
            <div className={`more-window ${filter && 'active'}`}>

                <input

                    name="filter_name"
                    type="text"
                    placeholder="Product name"
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                />

                <label>
                    From:
                    <input
                        name="filter_date_from"
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                    />
                </label>

                <label>
                    To:
                    <input
                    
                        name="filter_date_to"
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                    />
                </label>

                <button
                    onClick={() => {
                        setFilterName("");
                        setFromDate("");
                        setToDate("");
                        setFilter(false)
                    }}
                >
                    Clear
                </button>
                
            </div>

            <div className="table-container">

            <table
                tabIndex={0}
                onKeyDown={handleKeyPress}
            >
                <thead>
                    <tr> 
                        <td>Name</td>
                        <td>Quantity</td>
                        <td>Selling Price</td> 
                        <td>Date</td>
                    </tr>
                </thead>
                <tbody>
                    {filteredEntries.map(entry=>
                    <tr 
                    key={entry.time}
                    className={selectedRow===entry.time? "selected": ''} 
                    onClick={()=>setSelectedRow(entry.time)}
                    onTouchStart={() => startLongPress(entry.time)}
                    onTouchEnd={cancelLongPress}
                    onTouchMove={cancelLongPress}
                    > 
                        <td>{entry.name}</td>
                        <td>{entry.count}</td>
                        <td>{entry.price} /-</td> 
                        <td>{new Date(entry.time).toLocaleDateString('en-GB')}</td>
                    </tr>
                )}
                </tbody>
                
            </table>
            {actionMenu && (
                            <div className="action-menu"  onClick={() => setActionMenu(false)}>
                                <div>
                                    <button onClick={() => {
                                        handleEdit(selectedRow)
                                        setActionMenu(false)
                                        }}>
                                        Edit
                                    </button>

                                    <button 
                                    onClick={() => {setConfirm(()=>handleDelete)
                                    }}
                                    >
                                        Delete
                                    </button>

                                    <button onClick={() => setActionMenu(false)}>
                                        Cancel
                                    </button>
                                </div>
                                
                            </div>
                )}
            {
                confirm && (
                    <div className="action-menu">
                        <div>
                            {confirm === deleteAllEntries
                            ?(<>
                            <p>Are you sure you want to delete all entries?</p>
                            <p>This process is <strong>irriversable</strong>.</p>
                            <p>Please make sure to <strong>Export</strong> the data first.</p>
                            <button
                            className="red"
                             onClick={async ()=>{
                                await deleteAllEntries();
                                setEntries([]);
                                setSelectedRow(null)
                                setConfirm(null);
                            }}>Confirm
                            </button>
                            </>)
                            :(<>
                            <p>Are you sure you want to delete this entry?</p>
                            <p>
                                <span>{entries.find(entry => entry.time === selectedRow)?.name} x </span>
                                <span>{entries.find(entry => entry.time === selectedRow)?.count} = </span>
                                <span>{entries.find(entry => entry.time === selectedRow)?.count * entries.find(entry => entry.time === selectedRow)?.price} /-</span>
                            </p>
                            <button
                                className="red"
                             onClick={async ()=>{
                                handleDelete(selectedRow)
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
     ):
     (
        <div>
             <h2>No sale recorded yet</h2>
            <p>Please go to <Link to="/">home page</Link> to add sales</p>
        </div>
    )
     }
     
    </main>
)    
}

export default ShowEntries