import React, {FC, useCallback, useEffect, useState} from "react";
import debounce from "lodash.debounce";
import {Need} from "../../types";
import {Link, List, ListItem, ListItemIcon, ListItemText, TextField} from "@mui/material";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import {Link as RLink} from "react-router-dom";
import {FormattedMessage, useIntl} from "react-intl";
import {ApiClient, sortByNames} from "../../utils";

const api = new ApiClient<Need, undefined, { s: string }>('needs');

const Needs: FC = () => {
  const intl = useIntl();
  const [term, setTerm] = useState<string>('');
  const search = useCallback(debounce((s: string) => {
    setTerm(s);
  }, 200), []);
  const [listing, setListing] = useState<Need[]>([]);

  useEffect(() => {
    api.all({ s: term })
      .then((data) => data.sort(sortByNames))
      .then((data) => setListing(data))
      .catch(console.error);
  }, [term]);

  return (
    <>
      <TextField
        label={intl.formatMessage({ id: 'input.needs.search.label' })}
        variant="standard"
        onChange={(e) => search(e.target.value)}
        fullWidth
        sx={{ my: 2 }}
      />
      <List sx={{ maxHeight: 400 }}>
        {listing.map(need => (
          <ListItem key={`need-${need.id}`}>
            <ListItemIcon>
              <ShoppingBagIcon />
            </ListItemIcon>
            <ListItemText primary={need.name} />
            <Link to={`/locations/${need.locationId}`} component={RLink} color="inherit">
              <FormattedMessage id="page.needs.location.link" />
            </Link>
          </ListItem>
        ))}
      </List>
    </>
  )
}

export default Needs;
