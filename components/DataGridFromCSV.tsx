import { DataGrid, GridToolbar, gridClasses } from '@mui/x-data-grid';
import { Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, TextFieldProps } from '@mui/material';
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined';
import { alpha, styled } from '@mui/material/styles';
import { useState, useEffect, ReactNode } from 'react';
import { InteractiveConfig } from '../types/ChatContext';

const ODD_OPACITY = 1;

const StripedDataGrid = styled(DataGrid)(({ theme }) => ({
  [`& .${gridClasses.row}.even`]: {
    backgroundColor: theme.palette.mode === 'dark' ? '#333' : '#696a6b',
    '&:hover, &.Mui-hovered': {
      backgroundColor: theme.palette.action.hover,
      '@media (hover: none)': {
        backgroundColor: 'transparent',
      },
    },
    '&.Mui-selected': {
      backgroundColor: alpha(theme.palette.primary.main, ODD_OPACITY + theme.palette.action.selectedOpacity),
      '&:hover, &.Mui-hovered': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          ODD_OPACITY + theme.palette.action.selectedOpacity + theme.palette.action.hoverOpacity,
        ),
        // Reset on touch devices, it doesn't add specificity
        '@media (hover: none)': {
          backgroundColor: alpha(theme.palette.primary.main, ODD_OPACITY + theme.palette.action.selectedOpacity),
        },
      },
    },
  },
}));

export const DataGridFromCSV = ({ state, csvData }: { state: InteractiveConfig; csvData: string }): ReactNode => {
  const [open, setOpen] = useState(false);
  const [userMessage, setUserMessage] = useState('Surprise me!');
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const parseCSV = (csvData): void => {
    let headers = [];
    const lines = csvData.split('\n');
    if (lines.length === 2) {
      return csvData;
    }
    const rawHeaders = lines[1].split(',');
    headers = rawHeaders.map((header) => header.trim());
    const newRows = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[String(i)].split('","');
      if (values.length === headers.length) {
        const row = {} as {
          id: number;
        };
        for (let j = 0; j < headers.length; j++) {
          values[String(j)] = values[String(j)].trim();
          if (values[String(j)].startsWith('"') && values[String(j)].endsWith('"')) {
            values[String(j)] = values[String(j)].slice(1, -1);
          }
          if (values[String(j)].startsWith('"')) {
            values[String(j)] = values[String(j)].slice(1);
          }
          if (values[String(j)].endsWith('"')) {
            values[String(j)] = values[String(j)].slice(0, -1);
          }
          row[headers[String(j)]] = values[String(j)];
        }
        if (!row.id) {
          row.id = i;
        }
        newRows.push(row);
      }
      if (i === 1 && newRows.length > 0) {
        newRows.shift();
      }
    }
    headers = headers
      .filter((header) => header !== 'id')
      .map((header) => ({
        field: header,
        width: Math.max(160, header.length * 10),
        flex: 1,
        resizeable: true,
        headerName: header,
        sx: {
          '& .MuiDataGrid-cell': {
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          },
        },
      }));
    // If none of the rows have a value, don't show the column
    headers = headers.filter((header) => {
      for (const row of newRows) {
        if (row[header.field]) {
          return true;
        }
      }
      return false;
    });
    setColumns(headers);
    setRows(newRows);
    // console.log('newRows', newRows);
    // console.log('headers', headers);
  };
  useEffect(() => {
    // console.log('Parsing CSV');
    parseCSV(csvData);
  }, [csvData]);

  const getInsights = async (userMessage): Promise<void> => {
    state.mutate((oldState) => ({ ...oldState, chatState: { ...oldState.chatState, isLoading: true } }));
    const lines = csvData.split('\n');
    lines.shift();
    lines.pop();
    const newCSVData = lines.join('\n');
    const chainArgs = {
      conversation_name: state.chatSettings.conversationName,
      text: newCSVData,
    };
    const response = await state.sdk.runChain(
      'Data Analysis',
      userMessage,
      state.chatSettings.selectedAgent,
      false,
      1,
      chainArgs,
    );
    state.mutate((oldState) => {
      return { ...oldState, chatState: { ...oldState.chatState, isLoading: false, lastResponse: response } };
    });
  };
  return rows.length > 1 ? (
    <>
      <StripedDataGrid
        density='compact'
        rows={rows}
        columns={columns}
        components={{ Toolbar: GridToolbar }}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 5,
            },
          },
        }}
        getRowClassName={(params) => (params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd')}
      />
      <br />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <Button
          color='info'
          variant='outlined'
          onClick={() => {
            setOpen(true);
          }}
        >
          <TipsAndUpdatesOutlinedIcon />
          &nbsp;Get Insights
        </Button>
      </Box>
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
        }}
      >
        <DialogTitle>Get Insights</DialogTitle>
        <DialogContent>
          <TextField
            margin='dense'
            id='name'
            label='What would you like insights on?'
            fullWidth
            value={userMessage}
            onChange={(event) => {
              setUserMessage(event.target.value);
            }}
            onClick={(e) => {
              if ((e.target as TextFieldProps).value === 'Surprise me!') {
                setUserMessage('');
              }
            }}
            variant='outlined'
            color='info'
          />
        </DialogContent>
        <DialogActions>
          <Button
            color='error'
            onClick={() => {
              setOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button
            color='info'
            onClick={() => {
              getInsights(userMessage);
              setOpen(false);
            }}
          >
            Get Insights
          </Button>
        </DialogActions>
      </Dialog>
    </>
  ) : (
    csvData
  );
};
export default DataGridFromCSV;