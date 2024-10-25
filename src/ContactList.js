import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import AddContact from './AddContact';
import { Card } from 'react-bootstrap';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from "primereact/dialog";
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { AiOutlineDelete, AiOutlineEdit, AiOutlinePlus } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { FaCloudUploadAlt } from 'react-icons/fa';
import 'react-datetime/css/react-datetime.css';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './App.css';

const ContactList = () => {
  const fileInputRef = useRef(null);
  const [contacts, setContacts] = useState([]);
  const [filter, setFilter] = useState('');
  const [showAddContactDialog, setShowAddContactDialog] = useState(false);
  const [sortField, setSortField] = useState('name');
  const [isEditContact, setIsEditContact] = useState(false);
  const [editData, setEditData] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  const fetchContacts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('https://screeching-chivalrous-stamp.glitch.me/getcontacts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContacts(response.data);
    } catch (error) {
      console.error('Error fetching contacts', error);
    }
    finally {
      setLoading(false);
    }
  };

  const fetchContactsByDate = async () => {

    try {
      if (!startDate) {
        alert("Select Start Date")
      }
      else if (!endDate) {
        alert("Select End Date")
      }
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('https://screeching-chivalrous-stamp.glitch.me/getcontacts/by-date', {
        headers: { Authorization: `Bearer ${token}` },
        params: { startDate, endDate },
      });
      setContacts(response.data.contacts);
    } catch (error) {
      console.error('Error fetching contacts', error);
    }
    finally {
      setLoading(false);
    }

  }

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleAddContactClick = () => {
    setShowAddContactDialog(true);
  };

  const handleCloseDialog = async () => {
    setShowAddContactDialog(false);
    fetchContacts();
  };

  const handleCloseUpdateDialog = async () => {
    setIsEditContact(false);
    fetchContacts();
  };

  const filteredContacts = contacts.filter((contact) => {
    const lowerCaseFilter = filter.toLowerCase();
    const name = contact.name ? contact.name.toLowerCase() : (contact.Name ? contact.Name.toLowerCase() : '');
    const email = contact.email ? contact.email.toLowerCase() : (contact.Email ? contact.Email.toLowerCase() : '');
    const address = contact.address ? contact.address.toLowerCase() : (contact.Address ? contact.Address.toLowerCase() : '');
    return (
      name.includes(lowerCaseFilter) ||
      email.includes(lowerCaseFilter) ||
      address.includes(lowerCaseFilter)
    );
  }).sort((a, b) => {
    const aField = a[sortField] ? a[sortField].toLowerCase() : '';
    const bField = b[sortField] ? b[sortField].toLowerCase() : '';
    return aField > bField ? 1 : -1;
  });

  const fileHandler = async (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const excelData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      if (excelData && excelData.length > 0) {
        const headers = excelData[0];
        const rows = excelData.slice(1);
        const contactObjects = rows.map((row) => {
          return headers.reduce((acc, header, index) => {
            acc[header] = row[index];
            return acc;
          }, {});
        });

        const newContacts = [];
        for (const contact of contactObjects) {
          const name = contact.Name || contact.name || '';
          const email = contact.Email || contact.email || '';
          const phone = contact.MobileNumber || contact.phone || contact.MobileNo || '';
          const address = contact.Address || contact.address || '';
          const timezone = contact.Timezone || 'Asia/Kolkata';
          try {
            setLoading(true);
            const token = localStorage.getItem('token');
            await axios.post(
              'https://screeching-chivalrous-stamp.glitch.me/contacts',
              { name, email, phone, address, timezone },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            alert(`Contact ${name} added successfully`);
            newContacts.push({ name, email, phone, address, timezone });

          } catch (error) {
            alert(`Failed to add contact ${name}: beacuse email/user already Exists.`, error);
          }
          finally {
            setLoading(false);
          }
        }
        setContacts(prevContacts => [...prevContacts, ...newContacts]);
        fetchContacts()
      } else {
        console.log('No data found in the Excel file.');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const header = () => {
    return (
      <div className="header-container ">
        <div>
          <button className="btn btn-primary" onClick={handleAddContactClick}><AiOutlinePlus /> Add Contact</button>
          <label htmlFor="file-upload" className="custom-file-upload mx-2" style={{ border: "1px solid blue", borderRadius: "4px", padding: "5px", backgroundColor: "blue", color: "white" }}>
            <input id="file-upload" type="file" style={{ display: 'none' }} ref={fileInputRef} onChange={fileHandler} accept=".xls,.xlsx" />
            <FaCloudUploadAlt /> Upload contacts
          </label>
        </div>
        <div>
          <button onClick={() => downloadFile('csv')} className="btn btn-success mx-2">Download CSV</button>
          <button onClick={() => downloadFile('excel')} className="btn btn-info mx-2">Download Excel</button>

          <select className="sort-select mx-2" onChange={(e) => setSortField(e.target.value)}>
            <option value="name">Sort by Name</option>
            <option value="email">Sort by Email</option>
            <option value="phone">Sort by MobileNumber</option>
            <option value="address">Sort by Address</option>
          </select>
        </div>
      </div>
    );
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <span>
        <AiOutlineEdit title="Edit" onClick={(e) => onEdit(rowData)} style={{ color: 'green', fontSize: '25px', cursor: 'pointer', marginLeft: '15px' }} />
        <AiOutlineDelete title="Delete" onClick={(e) => onDelete(rowData)} style={{ color: 'red', fontSize: '25px', cursor: 'pointer', marginLeft: '15px' }} />
      </span>

    );

  }

  const onEdit = (rowData) => {
    setIsEditContact(true)
    setEditData(rowData)
  }

  const onDelete = async (rowData) => {
    if (window.confirm(`Are you sure you want to delete ${rowData.name}?`)) {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        await axios.delete(`https://screeching-chivalrous-stamp.glitch.me/contacts/${rowData.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('Contact deleted successfully');
        const response = await axios.get('https://screeching-chivalrous-stamp.glitch.me/getcontacts', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setContacts(response.data);
      } catch (error) {
        alert('Error deleting contact: ' + error.response?.data?.error || 'An error occurred');
        console.error('Error deleting contact', error);
      }
      finally {
        setLoading(false);
      }
    }
  };

  const formattedContacts = filteredContacts.map(contact => ({
    ...contact,
    created_at: contact.created_at ? format(new Date(contact.created_at), 'dd/MM/yyyy hh:mm a') : 'N/A', // or some default value
    updated_at: contact.updated_at ? format(new Date(contact.updated_at), 'dd/MM/yyyy hh:mm a') : 'N/A' // or some default value
  }));

  // const handleDateChange = (date) => {
  //   // Format date to dd/mm/yy hh:mm A (AM/PM)
  //   const formattedDate = moment(date).format('DD/MM/YY hh:mm A');
  //   console.log('Selected Date:', formattedDate);
  //   setStartDate(formattedDate);
  // };
  // const handleEndDateChange = (date) => {
  //   // Format date to dd/mm/yy hh:mm A (AM/PM)
  //   const formattedDate = moment(date).format('DD/MM/YY hh:mm A');
  //   console.log('Selected Date:', formattedDate);
  //   setEndDate(formattedDate);
  // };

  const downloadFile = (fileType) => {
    const fileEndpoint = fileType === 'csv' ? '/download/contacts-csv' : '/download/contacts-excel';
    window.location.href = `https://screeching-chivalrous-stamp.glitch.me${fileEndpoint}`;
  };

  const onLogout = () => {
    localStorage.removeItem('token');
    // navigate("/login")
    navigate('/login', { replace: true });
  }

  return (
    <div className='m-5'>

      <div className="d-flex justify-content-between align-items-center position-relative">
        <h1 className="form-title position-absolute start-50 translate-middle-x">Contacts List</h1>
        <button style={{ width: "200px" }} className="form-button ms-auto mb-2" onClick={onLogout}>Logout</button>
      </div>
      <Card style={{ padding: '20px' }} >
        <div style={{ marginTop: '5px' }}>
          <div className="filter-section">
            <div className='d-flex p-2'>
              <div className='d-flex'>
                <label className='px-2 pt-4'>Select Start Date: </label>
                {/* <Datetime value={startDate} onChange={handleDateChange} dateFormat="DD/MM/YY" timeFormat="hh:mm A" className='form-control mt-3 mx-2' inputProps={{ placeholder: 'DD/MM/YY HH:MM AM/PM' }}/> */}
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="Start Date" className='form-control mt-3 mx-2' style={{ width: "150px" }} />
              </div>
              <div className='d-flex'>
                <label className='px-3 pt-4'>Select End Date: </label>
                {/* <Datetime value={endDate} onChange={handleEndDateChange} dateFormat="DD/MM/YY" timeFormat="hh:mm A" className='form-control mt-3 mx-2' inputProps={{ placeholder: 'DD/MM/YY HH:MM AM/PM' }}/> */}
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="End Date" className='form-control mt-3 mx-2' style={{ width: "150px" }} />
              </div>
              <button onClick={fetchContactsByDate} className="form-button mx-3 mt-3" style={{ width: "100px", height: "50px" }}>Filter</button>
            </div>
          </div>

          {loading && <div className="loader-container"><div className="loader-spinner"></div></div>}
          <DataTable value={formattedContacts} paginator className="p-datatable" header={header} rows={5} style={{ maxHeight: window.innerHeight - 250 }} scrollHeight={window.innerHeight - 150} emptyMessage="No contacts found" responsiveLayout="scroll">
            <Column field="name" header="Name" sortable filter filterPlaceholder="Search by name" />
            <Column field="email" header="Email" sortable filter filterPlaceholder="Search by email" />
            <Column field="phone" header="Phone" sortable filter filterPlaceholder="Search by phone" />
            <Column field="address" header="Address" sortable filter filterPlaceholder="Search by address" />
            <Column field="created_at" header="Created Date" sortable />
            <Column field="updated_at" header="Updated Date" sortable />
            <Column header="Actions" body={actionBodyTemplate}></Column>
          </DataTable>
        </div>
      </Card>
      <Dialog visible={showAddContactDialog} modal onHide={() => handleCloseDialog()}>
        <AddContact onClose={handleCloseDialog} />
      </Dialog>
      <Dialog visible={isEditContact} modal onHide={() => handleCloseUpdateDialog()}>
        <AddContact onClose={handleCloseUpdateDialog} editData={editData} />
      </Dialog>

    </div>
  );
};

export default ContactList;
