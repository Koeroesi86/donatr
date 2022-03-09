import React, {FC, useCallback, useEffect, useState} from "react";
import debounce from "lodash.debounce";
import {Need} from "../../types";
import {InputAdornment, Link, List, ListItem, ListItemIcon, ListItemText, TextField} from "@mui/material";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import SearchIcon from '@mui/icons-material/Search';
import {Link as RLink} from "react-router-dom";
import {FormattedMessage} from "react-intl";
import {ApiClient} from "../../utils";

const api = new ApiClient<Need, undefined, { s: string }>('needs');

const Needs: FC = () => {
  const [term, setTerm] = useState<string>('');
  const search = useCallback(debounce((s: string) => {
    setTerm(s);
  }, 200), []);
  const [listing, setListing] = useState<Need[]>([]);

  useEffect(() => {
    api.all({ s: term })
      .then((data) => data.sort((a, b) => a.name.localeCompare(b.name)))
      .then((data) => setListing(data))
      .catch(console.error);
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
          <ListItem key={`need-${need.id}`}>
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
