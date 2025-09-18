import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import TransactionsTable from "../components/TransactionsTable";
import FiltersPanel from "../components/FiltersPanel";
import Pagination from "../components/Pagination";
import fetchTransactions from "../api/transactions"; // default import
import useDebounce from "../utils/useDebounce";

export default function TransactionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL params
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10);
  const sort = searchParams.get("sort") || "payment_time";
  const order = searchParams.get("order") || "desc";
  const q = searchParams.get("q") || "";
  const statuses = searchParams.getAll("status") || [];
  const schools = searchParams.getAll("school") || [];
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";

  // state
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ total: 0 });
  const debouncedQ = useDebounce(q, 300);

  // load transactions safely
  useEffect(() => {
    const loadTransactions = async () => {
      setLoading(true);
      try {
        const params = { page, limit, sort, order };
        if (statuses.length) params.status = statuses;
        if (schools.length) params.school = schools;
        if (debouncedQ) params.q = debouncedQ;
        if (from) params.from = from;
        if (to) params.to = to;

        const resp = await fetchTransactions(params);
        setRows(resp?.data?.data || []);
        setMeta(resp?.data?.meta || { total: 0 });
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setRows([]);
        setMeta({ total: 0 });
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [
    page,
    limit,
    sort,
    order,
    statuses.join(","),
    schools.join(","),
    debouncedQ,
    from,
    to,
  ]);

  // update URL search params
  const updateParams = (changes) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(changes).forEach(([key, value]) => {
      next.delete(key);
      if (value == null) return;
      if (Array.isArray(value)) value.forEach((v) => next.append(key, v));
      else next.set(key, value);
    });
    setSearchParams(next);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Transactions</h2>

      <FiltersPanel
        q={q}
        status={statuses}
        schoolIds={schools}
        from={from}
        to={to}
        onChange={updateParams}
      />

      <TransactionsTable
        loading={loading}
        rows={rows}
        sortField={sort}
        sortOrder={order}
        onSortChange={(field, dir) =>
          updateParams({ sort: field, order: dir, page: 1 })
        }
      />

      <Pagination
        page={page}
        limit={limit}
        total={meta?.total || 0}
        onPageChange={(p) => updateParams({ page: p })}
        onLimitChange={(l) => updateParams({ limit: l, page: 1 })}
      />
    </div>
  );
}
