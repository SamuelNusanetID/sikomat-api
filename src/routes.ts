
import { AdminController } from "./controllers/AdminController";
import { AuthController } from "./controllers/AuthController";
import { BidanController } from "./controllers/BidanController";
import { RefController } from "./controllers/RefController";
import { ReportController } from "./controllers/ReportController";
import { StatistikController } from "./controllers/StatistikController";
import { SuController } from "./controllers/SuController";
import { UserController } from "./controllers/UserController";
export const Routes = [
    {
        method: "get",
        route: "/api/report/qr/:text",
        controller: ReportController,
        action: "qr"
    },
    {
        method: "get",
        route: "/api/checktoken",
        controller: AuthController,
        action: "checkToken"
    },
    {
        method: "post",
        route: "/api/login",
        controller: AuthController,
        action: "login"
    },
    {
        method: "post",
        route: "/api/register",
        controller: AuthController,
        action: "register"
    },
    {
        method: "get",
        route: "/api/bidan/profile",
        controller: BidanController,
        action: "profile"
    },
    {
        method: "get",
        route: "/api/bidan/anc/:pasien",
        controller: BidanController,
        action: "getAnc"
    },
    {
        method: "post",
        route: "/api/bidan/anc/add",
        controller: BidanController,
        action: "addAnc"
    },
    {
        method: "post",
        route: "/api/bidan/anc/skreening/add",
        controller: BidanController,
        action: "addSkreening"
    },
    {
        method: "post",
        route: "/api/bidan/anc/detail/add",
        controller: BidanController,
        action: "addDetailAnc"
    },
    {
        method: "post",
        route: "/api/bidan/update",
        controller: BidanController,
        action: "update"
    },
    {
        method: "get",
        route: "/api/bidan/pasien/report/:riwayat_pasien",
        controller: ReportController,
        action: "riwayatKeluhanPasienReport"
    },
    {
        method: "post",
        route: "/api/bidan/pasien/add",
        controller: BidanController,
        action: "pasienAdd"
    },
    {
        method: "get",
        route: "/api/bidan/pasien/list",
        controller: BidanController,
        action: "pasienList"
    },
    {
        method: "post",
        route: "/api/bidan/pasien/riwayat/add",
        controller: BidanController,
        action: "riwayatPasienAdd"
    },
    {
        method: "get",
        route: "/api/bidan/pasien/riwayat/feedback/unread",
        controller: BidanController,
        action: "unread"
    },
    {
        method: "get",
        route: "/api/bidan/pasien/riwayat/feedback/read/:id",
        controller: BidanController,
        action: "feebackRead"
    },
    {
        method: "get",
        route: "/api/bidan/pasien/riwayat/get/:riwayat_pasien",
        controller: BidanController,
        action: "riwayatKeluhanPasienGet"
    },
    {
        method: "get",
        route: "/api/bidan/pasien/riwayat/partograf/:path",
        controller: BidanController,
        action: "getPartograf"
    },
    {
        method: "post",
        route: "/api/bidan/pasien/keluhan/add",
        controller: BidanController,
        action: "keluhanPasienAdd"
    },
    {
        method: "get",
        route: "/api/ref/kelompokkeluhan",
        controller: RefController,
        action: "kelompokKeluhan"
    },
    {
        method: "get",
        route: "/api/ref/hotline",
        controller: RefController,
        action: "hotline"
    },

    {
        method: "get",
        route: "/api/ref/keluhan/:kelompok_keluhan",
        controller: RefController,
        action: "keluhan"
    },
    {
        method: "post",
        route: "/api/user/update",
        controller: UserController,
        action: "update"
    },
    {
        method: "post",
        route: "/api/user/fcm/token",
        controller: UserController,
        action: "fcmtoken"
    },
    {
        method: "get",
        route: "/api/user/profile",
        controller: UserController,
        action: "profile"
    },
    {
        method: "get",
        route: "/api/admin/incoming",
        controller: AdminController,
        action: "incoming"
    },
    {
        method: "get",
        route: "/api/admin/riwayat",
        controller: AdminController,
        action: "riwayat"
    },
    {
        method: "get",
        route: "/api/admin/bidan/all",
        controller: AdminController,
        action: "allbidan"
    },
    {
        method: "get",
        route: "/api/admin/bidan/find",
        controller: AdminController,
        action: "findbidan"
    },
    {
        method: "post",
        route: "/api/admin/riwayat/feedback",
        controller: AdminController,
        action: "feedback"
    },
    {
        method: "post",
        route: "/api/admin/anc/feedback",
        controller: AdminController,
        action: "feedback_anc"
    },
    {
        method: "get",
        route: "/api/admin/anc",
        controller: AdminController,
        action: "anc"
    },
    {
        method: "post",
        route: "/api/su/auth",
        controller: SuController,
        action: "auth"
    },
    {
        method: "get",
        route: "/api/su/stats",
        controller: StatistikController,
        action: "stats"
    },
    {
        method: "get",
        route: "/api/su/bidan",
        controller: SuController,
        action: "getAllBidan"
    },
    {
        method: "post",
        route: "/api/su/bidan",
        controller: SuController,
        action: "saveBidan"
    },
    {
        method: "delete",
        route: "/api/su/bidan/:id",
        controller: SuController,
        action: "deleteBidan"
    },
    {
        method: "post",
        route: "/api/su/bidan/approve",
        controller: SuController,
        action: "approvedBidan"
    },
    {
        method: "get",
        route: "/api/su/spesialis",
        controller: SuController,
        action: "getAllSpesialis"
    },
    {
        method: "post",
        route: "/api/su/spesialis",
        controller: SuController,
        action: "saveSpesialis"
    },
    {
        method: "delete",
        route: "/api/su/spesialis/:id",
        controller: SuController,
        action: "deleteSpesialis"
    },
    {
        method: "post",
        route: "/api/su/spesialis/approve",
        controller: SuController,
        action: "approvedSpesialis"
    },
    {
        method: "get",
        route: "/api/su/riwayat/all",
        controller: SuController,
        action: "riwayat"
    },
    {
        method: "get",
        route: "/api/su/bidan/:id",
        controller: SuController,
        action: "getDataBidanByID"
    },
    {
        method: "get",
        route: "/api/su/spesialis/:id",
        controller: SuController,
        action: "getDataSpesialisByID"
    }
];