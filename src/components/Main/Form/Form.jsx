import React,{useState,useContext,useEffect} from 'react';
import { TextField, Typography, Grid, Button, FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import useStyles from './styles';
import { ExpenseTrackerContext } from '../../../context/context';
import { v4 as uuidv4 } from 'uuid';
import { incomeCategories, expenseCategories } from '../../../constants/categories';
import formateDate from '../../../utils/formateDate';
import { useSpeechContext } from '@speechly/react-client';
const Form = () => {
    const classes = useStyles();
    const initialState = {
        amount: '',
        category: '',
        type: 'Income',
        date: formateDate(new Date())
    };
  console.log(initialState.date);
    const [formData, setformData] = useState(initialState);
    const { addTransaction } = useContext(ExpenseTrackerContext);
    const selectedCategories = formData.type === 'Income' ? incomeCategories : expenseCategories;
  const createTransaction = () => {
    if (Number.isNaN(Number(formData.amount)) || !formData.date.includes('-')) return;
    const transaction = { ...formData, amount: Number(formData.amount), id: uuidv4() }
      
    addTransaction(transaction);
    setformData(initialState);
  };
  const { segment } = useSpeechContext();
    useEffect(() => {
    if (segment) {
      if (segment.intent.intent === 'add_expense') {
        setformData({ ...formData, type: 'Expense' });
      } else if (segment.intent.intent === 'add_income') {
        setformData({ ...formData, type: 'Income' });
      } else if (segment.isFinal && segment.intent.intent === 'create_transaction') {
        return createTransaction();
      } else if (segment.isFinal && segment.intent.intent === 'cancel_transaction') {
        return setformData(initialState);
      }

      segment.entities.forEach((s) => {
        const category = `${s.value.charAt(0)}${s.value.slice(1).toLowerCase()}`;

        switch (s.type) {
          case 'amount':
            setformData({ ...formData, amount: s.value });
            break;
          case 'category':
            if (incomeCategories.map((iC) => iC.type).includes(category)) {
              setformData({ ...formData, type: 'Income', category });
            } else if (expenseCategories.map((iC) => iC.type).includes(category)) {
              setformData({ ...formData, type: 'Expense', category });
            }
            break;
          case 'date':
            setformData({ ...formData, date: s.value });
            break;
          default:
            break;
        }
      });

      if (segment.isFinal && formData.amount && formData.category && formData.type && formData.date) {
        createTransaction();
      }
    }
  }, [segment]);
    return (
     <Grid container spacing={2}>
      
      <Grid item xs={12}>
        <Typography align="center" variant="subtitle2" gutterBottom>
       {segment ? (
        <div className="segment">
          {segment.words.map((w) => w.value).join(" ")}
        </div>
      ) : null}
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <FormControl fullWidth>
          <InputLabel>Type</InputLabel>
          <Select value={formData.type} onChange={(e)=>setformData({...formData,type:e.target.value})}>
            <MenuItem value="Income">Income</MenuItem>
            <MenuItem value="Expense">Expense</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={6}>
        <FormControl fullWidth>
          <InputLabel>Category</InputLabel>
            <Select  value={formData.category} onChange={(e)=>setformData({...formData,category:e.target.value})} >
           {selectedCategories.map((c) => <MenuItem key={c.type} value={c.type}>{c.type}</MenuItem>)}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={6}>
        <TextField type="number" label="Amount"  value={formData.amount} onChange={(e)=>setformData({...formData,amount:e.target.value})}  fullWidth />
      </Grid>
      <Grid item xs={6}>
        <TextField fullWidth label="Date" type="date"  value={formData.date} onChange={(e)=>setformData({...formData,date:formateDate(e.target.value)})}  />
      </Grid>
      <Button className={classes.button} variant="outlined" color="primary" fullWidth onClick={createTransaction} >Create</Button>
    </Grid>
    )
}

export default Form
