

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddContact from './AddContact';
import { Card } from 'react-bootstrap';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from "primereact/dialog";
import { format } from 'date-fns';
import { AiOutlineDelete, AiOutlineEdit, AiOutlinePlus } from 'react-icons/ai';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './App.css';

const ContactList = () => {
  const [contacts, setContacts] = useState([]);
  const [filter, setFilter] = useState('');
  const [showAddContactDialog, setShowAddContactDialog] = useState(false);
  const [sortField, setSortField] = useState('name');
  const [isEditContact, setIsEditContact] = useState(false);
  const [editData, setEditData] = useState([]);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://screeching-chivalrous-stamp.glitch.me/getcontacts', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setContacts(response.data);
      } catch (error) {
        console.error('Error fetching contacts', error);
      }
    };
    fetchContacts();
  }, []);

  const handleAddContactClick = () => {
    setShowAddContactDialog(true);
  };

  const handleCloseDialog = async () => {
    setShowAddContactDialog(false);
    const token = localStorage.getItem('token');
    const response = await axios.get('https://screeching-chivalrous-stamp.glitch.me/getcontacts', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setContacts(response.data);
  };

  const handleCloseUpdateDialog = async () => {
    setIsEditContact(false);
    const token = localStorage.getItem('token');
    const response = await axios.get('https://screeching-chivalrous-stamp.glitch.me/getcontacts', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setContacts(response.data);
  };


  const filteredContacts = contacts
    .filter((contact) => {
      const lowerCaseFilter = filter.toLowerCase();
      return (
        contact.name.toLowerCase().includes(lowerCaseFilter) ||
        contact.email.toLowerCase().includes(lowerCaseFilter) ||
        contact.address.toLowerCase().includes(lowerCaseFilter) ||
        contact.mobileNumber.toLowerCase().includes(lowerCaseFilter)
      );
    })
    .sort((a, b) => (a[sortField].toLowerCase() > b[sortField].toLowerCase() ? 1 : -1));

  const header = () => {
    return (
      <div className="header-container">
        <button className="add-contact-button" onClick={handleAddContactClick}><AiOutlinePlus style={{ marginRight: '8px' }} /> Add Contact</button>
        <select className="sort-select" onChange={(e) => setSortField(e.target.value)}>
          <option value="name">Sort by Name</option>
          <option value="email">Sort by Email</option>
          <option value="phone">Sort by MobileNumber</option>
          <option value="address">Sort by Address</option>
        </select>
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
    }
};

const formattedContacts = filteredContacts.map(contact => ({
  ...contact,
  created_at: format(new Date(contact.created_at), 'dd/MM/yyyy hh:mm a'),
  updated_at: format(new Date(contact.updated_at), 'dd/MM/yyyy hh:mm a')

}));


  return (
    <div>
      <h2 className="form-title">Contacts List</h2>
      <Card style={{ padding: '20px' }} >
        <div style={{ marginTop: '5px' }}>
          <DataTable value={formattedContacts} paginator showGridlines className="p-datatable" header={header} rows={8} style={{ maxHeight: window.innerHeight - 250 }} scrollHeight={window.innerHeight - 150} emptyMessage="No contacts found" responsiveLayout="scroll">
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
