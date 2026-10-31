export default function PortalIcon({ name }: { name: string }) {
    const paths: Record<string,string> = {
        salud:"M12 3 3 7v10l9 4 9-4V7l-9-4ZM3 7l9 4 9-4M12 11v10M9 5.7l9 4M8 15h4M10 13v4",
        warehouse:"M3 21V8l9-5 9 5v13M7 21V11h10v10M7 15h10M7 18h10",
        personas:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
        camion:"M1 4h14v13H1V4ZM15 8h4l3 4v5h-7M5.5 20a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5M18.5 20a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5",
        seguridad:"m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3ZM8 12l3 3 5-6",
        calidad:"M9 3h6l2 4 4 2v6l-4 2-2 4H9l-2-4-4-2V9l4-2 2-4ZM8 12l3 3 5-6",
        uom:"M4 4h16v16H4V4ZM8 8h8M8 12h3M8 16h3M14 12l2 2 4-4",
        traslados:"M3 7h16m-4-4 4 4-4 4M21 17H5m4-4-4 4 4 4",
        inventario:"M8 4H5v17h14V4h-3M8 3h8v4H8V3ZM8 11h8M8 15h8M8 18h5",
        analisis:"M3 3v18h18M7 16v-5M12 16V7M17 16v-8",
    };
    return <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]??paths.warehouse}/></svg>;
}
