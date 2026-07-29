export const PICKING_STYLES = `
    @page{
        size:A4 portrait;
        margin:9mm;
    }
    body{
        margin:0;
        padding:0;
        font-family:Arial,Helvetica,sans-serif;
        color:#000;
    }
    .page{
        width:100%;
        page-break-after:always;
        min-height:270mm;
        display:flex;
        flex-direction:column;
    }
    .page:last-child{
        page-break-after:auto;
    }
    .pageContent{
        flex:1;
    }

    /* ===========================
    HEADER
    =========================== */

    .header{
        margin-bottom:8px;
    }
    .headerTop{
        display:flex;
        align-items:center;
        justify-content:space-between;
    }
    .headerInfo{
        display:flex;
        justify-content:space-between;
        align-items:center;
        font-size:16px;
        margin:8px 0;
    }
    .logoBox{
        width:60px;
    }
    .logoPeYa{
        width:60px;
        display:block;
        margin:0 auto 6px auto;
    }
    .titleBox{
        flex:1;
        text-align:center;
        font-size:24px;
        font-weight:bold;
        color: #2b8179;
    }
    .title{
        text-align:center;
        font-size:22px;
        font-weight:bold;   
    }
    .label{
        font-weight:300;
    }
    .dateBox{
        width:140px;
        text-align:right;
        font-size:12px;
        line-height:18px;
    }
    .value{
        margin-left:4px;
        font-weight:bold;
    }
    .separator{
        border-top:2px solid #000;
        margin:8px 0;
    }
    .st{
        text-align:center;
        font-size:28px;
        font-weight:bold;
    }
    .destino{
        text-align:center;
        font-size:18px;
        margin-top:4px;
    }
    .lineCount{
        text-align:right;
        font-size:12px;
    }
    .printDate{
        text-align:right;
        font-size:11px;
        color:#555;
    }

    /* ===========================
    SECTORES
    =========================== */

    .sector{
        margin-top:5px;
    }
    .sectorTitle{
        background:#000;
        color:#fff;
        padding:4px 4px;
        font-weight:bold;
        font-size:14px;
        letter-spacing:1px;
    }

    /* ===========================
    TABLA
    =========================== */

    .pickingTable{
        width:100%;
        border-collapse:collapse;
        table-layout:fixed;
        margin-bottom:8px;
    }
    .pickingTable th{
        border-bottom:2px solid #000;
        padding:6px;
        font-size:12px;
        text-transform:uppercase;
    }
    .pickingTable td{
        border-bottom:1px solid #ddd;
        padding:3px 6px;
        vertical-align:middle;
    }

    /* ===========================
    COLUMNAS
    =========================== */

    .locationHeader{
        width:140px;
    }
    .barcodeHeader{
        width:180px;
    }
    .qtyHeader{
        width:80px;
    }
    .location{
        font-size:16px;
        font-weight:bold;
        white-space:nowrap;
    }
    .barcodeColumn{
        text-align:center;
    }
    .barcodeFont{
        font-family:'Libre Barcode 39',cursive;
        font-size:24px;
        line-height:0.8;
    }
    .barcodeText{
        font-size:11px;
        letter-spacing:1px;
        margin-top:-4px;
    }
    .description{
        font-size:12px;
        line-height:1.15;
    }
    .qty{
        text-align:center;
        font-size:20px;
        font-weight:bold;
        background:#f2f2f2;
    }

    /* ===========================
    FOOTER
    =========================== */

    .footer{
        margin-top:8px;
        text-align:center;
        font-size:11px;
        color:#666;
    }
    .footerBox{
        display:grid;
        grid-template-columns:1fr 1fr 1fr;
        border:2px solid #000;
        margin-top:4px;
        page-break-inside:avoid;
        break-inside:avoid;
    }
    .summary{
        padding:10px;
        display:flex;
        flex-direction:column;
        justify-content:space-evenly;
        gap:5px;
        border-right:2px solid #000;
        font-size:14px;
    }
    .signature{
        display:flex;
        flex-direction:column;
        border-right:2px solid #000;
    }
    .signature:last-child{
        border-right:none;
    }
    .signatureTitle{
        border-bottom:2px solid #000;
        text-align:center;
        padding:4px;
        font-weight:bold;
        font-size:14px;
    }
    .signatureSpace{
        flex:1;
        min-height:80px;
    }
`;