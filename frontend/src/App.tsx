import { useEffect, useMemo, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, Drawer, Typography, Rating, TextField, IconButton } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { fetchPage, search } from "./api";

type Recipe = {
  id: number;
  title: string;
  cuisine: string | null;
  rating: number | null;
  prep_time: number | null;
  cook_time: number | null;
  total_time: number | null;
  description: string | null;
  nutrients: any | null;
  serves: string | null;
};

const pageSizeOptions = [15, 20, 25, 30, 40, 50];

export default function App() {
  const [rows, setRows] = useState<Recipe[]>([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [fTitle, setFTitle] = useState("");
  const [fCuisine, setFCuisine] = useState("");
  const [fRating, setFRating] = useState("");
  const [fTotal, setFTotal] = useState("");
  const [fCalories, setFCalories] = useState("");

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Recipe | null>(null);
  const [showTimes, setShowTimes] = useState(false);

  const columns: GridColDef[] = useMemo(() => [
    {
      field: "title",
      headerName: "Title",
      flex: 2,
      renderCell: (p) => (
        <Typography noWrap title={p.value}>{p.value}</Typography>
      )
    },
    { field: "cuisine", headerName: "Cuisine", flex: 1 },
    {
      field: "rating",
      headerName: "Rating",
      flex: 1,
      renderCell: (p) => <Rating value={Number(p.value) || 0} precision={0.1} readOnly />
    },
    { field: "total_time", headerName: "Total Time", flex: 1 },
    { field: "serves", headerName: "Serves", flex: 1 }
  ], []);

  async function loadPage(p=page, ps=pageSize) {
    setLoading(true);
    const anyFilter = fTitle || fCuisine || fRating || fTotal || fCalories;
    if (anyFilter) {
      const params: Record<string,string> = {};
      if (fTitle) params.title = fTitle;
      if (fCuisine) params.cuisine = fCuisine;
      if (fRating) params.rating = fRating;
      if (fTotal) params.total_time = fTotal;
      if (fCalories) params.calories = fCalories;
      const { data } = await search(params);
      setRows(data);
      setTotal(data.length);
    } else {
      const { data, total, page: srvPage, limit } = await fetchPage(p+1, ps);
      setRows(data);
      setTotal(total);
      setPage(srvPage-1);
      setPageSize(limit);
    }
    setLoading(false);
  }

  useEffect(() => { loadPage(); }, []);
  useEffect(() => { loadPage(); }, [page, pageSize]);

  return (
    <Box p={2} display="grid" gap={2}>
      <Typography variant="h5">Recipes</Typography>

      <Box display="grid" gap={1} gridTemplateColumns="repeat(5, 1fr)">
        <TextField label="Title (contains)" value={fTitle} onChange={e=>setFTitle(e.target.value)} />
        <TextField label="Cuisine" value={fCuisine} onChange={e=>setFCuisine(e.target.value)} />
        <TextField label="Rating (e.g. >=4.5)" value={fRating} onChange={e=>setFRating(e.target.value)} />
        <TextField label="Total Time (e.g. <=120)" value={fTotal} onChange={e=>setFTotal(e.target.value)} />
        <TextField label="Calories (e.g. <=400)" value={fCalories} onChange={e=>setFCalories(e.target.value)} />
      </Box>
      <Box>
        <button onClick={()=>loadPage()}>Search</button>
        <button onClick={()=>{setFTitle("");setFCuisine("");setFRating("");setFTotal("");setFCalories("");loadPage();}}>Clear</button>
      </Box>

      <div style={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(r)=>r.id}
          loading={loading}
          pagination
          paginationMode="client"
          rowCount={total}
          page={page}
          onPageChange={setPage}
          pageSizeOptions={pageSizeOptions}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          onRowClick={(p)=>{ setSelected(p.row); setOpen(true); setShowTimes(false); }}
          slots={{
            noRowsOverlay: () => <Typography>No results found.</Typography>
          }}
        />
      </div>

      <Drawer anchor="right" open={open} onClose={()=>setOpen(false)}>
        <Box p={2} width={420} display="grid" gap={1}>
          <Typography variant="h6">{selected?.title}</Typography>
          <Typography variant="subtitle2" color="text.secondary">{selected?.cuisine}</Typography>

          <Typography fontWeight="bold">Description</Typography>
          <Typography>{selected?.description || "-"}</Typography>

          <Box display="flex" alignItems="center" gap={1}>
            <Typography fontWeight="bold">Total Time:</Typography>
            <Typography>{selected?.total_time ?? "-"}</Typography>
            <IconButton size="small" onClick={()=>setShowTimes(s=>!s)}>
              {showTimes ? <ExpandLessIcon/> : <ExpandMoreIcon/>}
            </IconButton>
          </Box>
          {showTimes && (
            <Box pl={1}>
              <Typography>Prep Time: {selected?.prep_time ?? "-"}</Typography>
              <Typography>Cook Time: {selected?.cook_time ?? "-"}</Typography>
            </Box>
          )}

          <Box mt={1}>
            <Typography fontWeight="bold">Nutrition</Typography>
            <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
              {["calories","carbohydrateContent","cholesterolContent","fiberContent","proteinContent","saturatedFatContent","sodiumContent","sugarContent","fatContent"].map(k=>(
                <tr key={k}>
                  <td style={{ padding: 4, fontWeight: 500 }}>{k}</td>
                  <td style={{ padding: 4 }}>{selected?.nutrients?.[k] ?? "-"}</td>
                </tr>
              ))}
            </Box>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
}
