export const PICKING_STYLES = `
    @page{
        size:A4 portrait;
        margin:5mm;
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
        min-height:272mm;
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
        margin-bottom:4px;
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
        margin:6px 0;
    }
    .logoBox{
        width:56px;
    }
    .logoPeYa{
        width:56px;
        display:block;
        margin:0 auto 4px auto;
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
        margin:4px 0;
    }
    .st{
        text-align:center;
        font-size:28px;
        font-weight:bold;
    }
    .destino{
        text-align:center;
        font-size:18px;
        margin-top:3px;
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
        margin-top:2px;
    }
    .sectorTitle{
        background:#000;
        color:#fff;
        padding:2px 2px;
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
        margin-bottom:4px;
    }
    .pickingTable th{
        border-bottom:2px solid #000;
        padding:4px;
        font-size:12px;
        text-transform:uppercase;
    }
    .pickingTable td{
        border-bottom:1px solid #ddd;
        padding:3px 4px;
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
        margin-top:-3px;
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
        margin-top:2px;
        text-align:center;
        font-size:11px;
        color:#666;
    }
    .footerBox{
        display:grid;
        grid-template-columns:1fr 1fr 1fr;
        border:2px solid #000;
        margin-top:2px;
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
        padding:2px;
        font-weight:bold;
        font-size:14px;
    }
    .signatureSpace{
        flex:1;
        min-height:80px;
    }
`;