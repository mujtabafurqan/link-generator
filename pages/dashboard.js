import { useState } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

function Home() {
  const [phoneNumber, setPhoneNumber] = useState('');

  const handlePhoneNumberChange = (event) => {
    setPhoneNumber(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(`/api/storeAlertNumber/${phoneNumber}`);
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <form onSubmit={handleSubmit}>
        <TextField
          id="phone-number"
          label="Enter phone number"
          variant="outlined"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={!phoneNumber}
          style={{ marginLeft: '10px' }}
        >
          Submit
        </Button>
      </form>
    </div>
  );
}

export default Home;
