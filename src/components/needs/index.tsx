import React, {FC, useCallback, useEffect, useState} from "react";
import debounce from "lodash.debounce";
import {Need} from "../../types";
import {InputAdornment, Link, List, ListItem, ListItemIcon, ListItemText, TextField} from "@mui/material";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import SearchIcon from '@mui/icons-material/Search';
import axios from "axios";
import {Link as RLink} from "react-router-dom";
import {FormattedMessage} from "react-intl";

const Needs: FC = () => {
  const [term, setTerm] = useState<string>('');
  const search = useCallback(debounce((s: string) => {
    setTerm(s);
  }, 200), []);
  const [listing, setListing] = useState<Need[]>([]);

  useEffect(() => {
    // eslint-disable-next-line no-restricted-globals
    const url = new URL(location.origin);
    url.pathname = '/api/needs';
    url.searchParams.set('s', term);
    axios.get(url.toJSON()).then(({ data }) => setListing(data)).catch(console.error);
  }, [term]);

  return (
    <>
      <TextField
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        variant="standard"
        onChange={(e) => search(e.target.value)}
        fullWidth
        sx={{ my: 2 }}
      />
      <List>
        {listing.map(need => (
          <ListItem key={need.id}>
            <ListItemIcon>
              <ShoppingBagIcon />
            </ListItemIcon>
            <ListItemText primary={need.name} />
            <Link to={`/location/${need.locationId}`} component={RLink} color="inherit">
              <FormattedMessage id="page.needs.location.link" />
            </Link>
          </ListItem>
        ))}
      </List>
    </>
  )
}

export default Needs;
