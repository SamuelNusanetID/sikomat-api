import { getCustomRepository, getRepository, Like } from "typeorm";
import { NextFunction, Request, Response } from "express";
import { UserRepository } from "../repositories/UserRepository";
import { RiwayatPasien } from "../entity/RiwayatPasien";
import { BidanRepository } from '../repositories/BidanRepository';
import { SuperUserRepository } from "../repositories/SuperUserRepository";
import { User } from "../entity/User";
import moment from "moment";
import { Pasien } from '../entity/Pasien';
import { PasienRepository } from "../repositories/PasienRepostiroy";
var fs = require("fs");
var path = require("path");
const jwt = require("jsonwebtoken");
const date = require('date-and-time')
const requestIp = require('request-ip');
require("dotenv").config();
const axios = require('axios');
const bcrypt = require("bcryptjs");

export interface IGetUserAuthInfoRequest extends Request {
    user: any // or any other type
}

export class SuController {
    private suRepository = getCustomRepository(SuperUserRepository);
    private pasienRepo = getCustomRepository(PasienRepository);
    private bidanRepo = getCustomRepository(BidanRepository);
    private userRepo = getCustomRepository(UserRepository);
    async generateAccessToken(username) {
        return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: "180000000s" });
    }
    private riwayatRepo = getRepository(RiwayatPasien);

    async auth(request: Request, response: Response, next: NextFunction) {
        let su = await this.suRepository.findByUsernamePassword(request.body.username, request.body.password)
        let token = ""
        if (su) {
            const now = new Date();
            token = await this.generateAccessToken({ username: request.body["username"] });
            let auth = {
                created: now, expired: date.addDays(now, 365),
                refresh_token: token,
                token: token,
                userType: su.user_type,
                username: su.username
            }

            return auth;
        }
        return { "token": "", "message": "User tidak ditemukan" };
    }

    async getAllBidan(request: IGetUserAuthInfoRequest, response: Response, next: NextFunction) {
        let su = await this.suRepository.findOne({
            "username": request.user.username
        });
        
        let data = {}

        data = await this.bidanRepo.createQueryBuilder('bidan')
                .innerJoinAndMapOne("bidan.user", User, 'user', 'bidan.hp = user.hp')
                .where('user.user_type = :utype', {utype: 'bidan'})
                .orderBy('bidan.id', 'DESC')
                .getMany();

        return { "data_bidan": data };
    }

    async saveBidan(request: IGetUserAuthInfoRequest, response: Response, next: NextFunction) {
        var salt = bcrypt.genSaltSync(10);
        let su = await this.suRepository.findOne({
            "username": request.user.username
        });

        if (await request.body.id) {
            let bidan = await this.bidanRepo.findOne({ id: request.body.id });

            if (bidan) {
                if (bidan.hp == request.body.hp) {
                    bidan.email = request.body.email;
                    bidan.nama = request.body.nama;
                    bidan.hp = request.body.hp;
                    bidan.alamat_detail = request.body.alamat_detail;
                    bidan.alamat_peta = request.body.alamat_peta;
                    
                    try {
                        let itemBidan = await this.bidanRepo.save(bidan)
                        return { "action_status": "success", "item": itemBidan, "message": "" };
                    } catch (error) {
                        return { "action_status": "success", "item": "", "message": error };
                    }                
                } else {
                    let bidan_check = await this.bidanRepo.find({
                        where: [{ hp: await request.body.hp }]
                    });
    
                    let user_check = await this.userRepo.find({
                        where: [{ hp: await request.body.hp }]
                    });
    
                    if (bidan_check.length == 0 && user_check.length == 0) {
                        let user = await this.userRepo.findOne({ hp: bidan.hp })
                        bidan.nama = request.body.nama;
                        bidan.email = request.body.email;
                        bidan.hp = request.body.hp;
                        bidan.alamat_detail = request.body.alamat_detail;
                        bidan.alamat_peta = request.body.alamat_peta;
    
                        user.hp = bidan.hp
                        user.nama = bidan.nama
    
                        try {
                            await this.userRepo.save(user)
                            let itemBidan = await this.bidanRepo.save(bidan)
                            return { "action_status": "success", "item": itemBidan, "message": "" };
                        } catch (error) {
                            return { "action_status": "warn", "item": "", "message": error };
                        }
                    } else {
                        return { "action_status": "warn", "item": "", "message": "Data bidan sudah ada" };
                    }
                }
            } else {
                return { "action_status": "warn", "item": "", "message": "Data bidan tidak ada" };
            }
            
        } else {
            let itemBidan;
            let bidan_check = await this.bidanRepo.find({
                where: [{ 
                    nama: await request.body.nama, 
                    alamat_peta: await request.body.alamat_peta, 
                    alamat_detail: await request.body.alamat_detail, 
                    hp: await request.body.hp,
                }]
            });
            let user_check = await this.userRepo.find({
                where: [{ 
                    nama: await request.body.nama,
                    hp: await request.body.hp,
                }]
            });
            
            if (bidan_check.length == 0 && user_check.length == 0) {
                let newBidan = await request.body;
                Object.keys(newBidan).forEach((k) => newBidan[k] == "" && delete newBidan[k]);

                try {
                    newBidan.rekanan = su.user_type;
                    itemBidan = await this.bidanRepo.save(newBidan)

                    let newUser = new User();
                    newUser.hp = newBidan.hp;
                    newUser.user_type = "bidan";
                    newUser.nama = newBidan.nama;
                    newUser.password = bcrypt.hashSync(request.body.password, salt);
                    await this.userRepo.save(newUser);
                } catch (error) {
                    return { "action_status": "warn", "item": "", "message": error };
                }

                return { "action_status": "success", "item": itemBidan, "message": "" };
            } else {
                return { "action_status": "warn", "item": "", "message": "Bidan dengan email atau nomor hp sudah ada" };
            }
        }
    }

    async deleteBidan(request: IGetUserAuthInfoRequest, response: Response, next: NextFunction) {
        let su = await this.suRepository.findOne({
            "username": request.user.username
        });
        let id = await parseInt(request.params['id']);
        let bidan = await this.bidanRepo.findOne({id: id});
        if (bidan) {
            try {
                await this.bidanRepo.delete({id: id});
                return { "action_status": "success", "item": [], "message": "Berhasil menghapus data bidan." };
            } catch (error) {
                return { "action_status": "failed", "item": [], "message": error.detail };
            }
        } else {
            return { "action_status": "failed", "item": [], "message": "Data Tidak dapat dihapus karena data bidan tidak ditemukan." };
        }
    }

    async getAllSpesialis(request: IGetUserAuthInfoRequest, response: Response, next: NextFunction) {
        let su = await this.suRepository.findOne({
            "username": request.user.username
        });
        
        let data = {}
        let keyword = request.query['keyword'];

        if (request.query['keyword']) {
            console.log(request.query['keyword']);
            data = await this.userRepo.createQueryBuilder('user')
                .where("(hp ilike :keyword or nama ilike :keyword) and user_type=:user_type", { keyword: `%${keyword}%`, user_type: 'admin' })
                .orderBy('user.id', 'DESC')
                .getMany();

        } else {
            data = await this.userRepo.createQueryBuilder('user')
                .where("user_type= :user_type", { user_type: "admin" })
                .orderBy('user.id', 'DESC')
                .getMany();
        }

        return { "data_spesialis": data };
    }

    async saveSpesialis(request: IGetUserAuthInfoRequest, response: Response, next: NextFunction) {
        var salt = bcrypt.genSaltSync(10);
        var now = new Date();
        
        let su = await this.suRepository.findOne({
            "username": request.user.username
        });
    
        if (await request.body.id) {
            let user = await this.userRepo.findOne({ id: request.body.id })

            if (user) {
                if (user.email == request.body.email && user.hp == request.body.hp) {
                    Object.keys(request.body).forEach((k) => request.body[k] == "" && delete request.body[k]);
                    user.nama = request.body.nama;

                    try {
                        let itemUser = await this.userRepo.save(user);
                        return { "action_status": "success", "item": itemUser, "message": "" };
                    } catch (error) {
                        return { "action_status": "warn", "item": "", "message": error };
                    }
                } else {
                    let user_check = await this.userRepo.find({
                        where: [{ nama: Like(request.body.nama), hp: Like(request.body.hp) }]
                    });

                    if (user_check.length == 0) {
                        Object.keys(request.body).forEach((k) => request.body[k] == "" && delete request.body[k]);
                        user.nama = request.body.nama;
                        user.hp = request.body.hp;
                        
                        try {
                            let itemUser = await this.userRepo.save(user);
                            return { "action_status": "success", "item": itemUser, "message": "" };
                        } catch (error) {
                            return { "action_status": "warn", "item": "", "message": error };
                        }
                    } else {
                        return { "action_status": "warn", "item": "", "message": "Data spesialis sudah ada" };
                    }
                }
            } else {
                return { "action_status": "warn", "item": "", "message": "Data spesialis sudah ada" };
            }
        } else {
            const user_check = await this.userRepo.find({
                where: [{ nama: Like(request.body.nama), hp: Like(request.body.hp) }]
            });

            if (user_check.length < 1) {
                let newUser = await request.body;
        
                newUser.password = bcrypt.hashSync(request.body.password, salt);
                newUser.user_type = "admin";
                newUser.status = 1;
                newUser.activation_request_date = moment(now).format("YYYY-MM-DD HH:mm:ss");
                newUser.activation_date = moment(now).format("YYYY-MM-DD HH:mm:ss");

                Object.keys(newUser).forEach((k) => newUser[k] == "" && delete newUser[k]);

                try {
                    let item = await this.userRepo.save(newUser)
                    return { "action_status": "success", "item": item, "message": "" };
                } catch (error) {
                    return { "action_status": "warn", "item": "", "message": error };
                }
            } else {
                return { "action_status": "warn", "item": "", "message": "Data spesialis sudah ada" };
            }
        }
    }

    async deleteSpesialis(request: Request, response: Response, next: NextFunction) {
        let id = await parseInt(request.params['id']);

        let user = await this.userRepo.findOne({ id: id })

        try {
            await this.userRepo.delete(user)
            return { "action_status": "success", "item": user, "message": "" };
        } catch (error) {
            return { "action_status": "failed", "item": user, "message": "Data Tidak dapat dihapus karena bidan sudah melakukan aktivitas" };
        }
    }

    async riwayat(request: IGetUserAuthInfoRequest, response: Response, next: NextFunction) {
        let su = await this.suRepository.findOne({
            "username": request.user.username
        });
        let keyword = request.query['keyword'];
        let data = {}
        
        if (request.query['keyword']) {
            data = await this.riwayatRepo.createQueryBuilder('riwayat_pasien')
                .innerJoinAndSelect("riwayat_pasien.pasien", "pasien")
                .innerJoinAndSelect("pasien.bidan", "bidan")
                .innerJoinAndSelect("riwayat_pasien.kelompok_keluhan", "kelompok_keluhan")
                .where("pasien.nama ilike :keyword or bidan.nama ilike :keyword or bidan.nama ilike :keyword or bidan.hp ilike :keyword", { keyword: `%${keyword}%` })
                .orderBy('riwayat_pasien.id', 'DESC')
                .getMany();
        } else {
            data = await this.riwayatRepo.createQueryBuilder('riwayat_pasien')
                .innerJoinAndSelect("riwayat_pasien.pasien", "pasien")
                .innerJoinAndSelect("pasien.bidan", "bidan")
                .innerJoinAndSelect("riwayat_pasien.kelompok_keluhan", "kelompok_keluhan")
                .orderBy('riwayat_pasien.id', 'DESC')
                .getMany();
        }

        return { "data_riwayat": data };
    }

    async approvedBidan(request: IGetUserAuthInfoRequest, response: Response, next: NextFunction) {
        let now = new Date();
        let bidanUser = await this.bidanRepo.findOne({
            id: request.body.id
        });
    
        if (bidanUser) {
            let userFindBidan = await this.userRepo.findByHp(bidanUser.hp);
            if (userFindBidan) {
                userFindBidan.activation_date = new Date(Date.now());
                userFindBidan.activation_request_date = new Date(Date.now());
                userFindBidan.status = 1;
                await this.userRepo.save(userFindBidan);

                return { "action_status": "success", "item": userFindBidan, "message": "" };
            } else {
                return { "action_status": "failed", "item": userFindBidan, "message": "Data tidak dapat diperbaharui karena data bidan tidak ditemukan." };
            }
        } else {
            return { "action_status": "failed", "item": bidanUser, "message": "Data tidak dapat diperbaharui karena data bidan tidak ditemukan." };
        }
    }
    
    async approvedSpesialis(request: IGetUserAuthInfoRequest, response: Response, next: NextFunction) {
        let now = new Date();
        let userFindSpesialis = await this.userRepo.find({
            id: request.body.id
        });

        if (userFindSpesialis) {
            if (userFindSpesialis[0].user_type == "admin") {
                userFindSpesialis[0].activation_date = new Date(Date.now());
                userFindSpesialis[0].activation_request_date = new Date(Date.now());
                userFindSpesialis[0].status = 1;
                await this.userRepo.save(userFindSpesialis);

                return { "action_status": "success", "item": userFindSpesialis[0], "message": "" };
            } else {
                return { "action_status": "failed", "item": userFindSpesialis[0], "message": "Data tidak dapat diperbaharui karena data yang di inisiasi salah." };
            }
        } else {
            return { "action_status": "failed", "item": userFindSpesialis[0], "message": "Data tidak dapat diperbaharui karena data spesialis tidak ditemukan." };
        }
    }

    async getDataBidanByID(request: Request, response: Response, next: NextFunction) {
        let id = await parseInt(request.params['id']);
        
        let dataBidanByID = await this.bidanRepo.count({
            id: id
        });

        if (dataBidanByID > 0) {
            return { "data_bidan": await this.bidanRepo.findOne({where: {id: id}}) };
        } else {
            return { "data_bidan": {} };
        }
    }

    async getDataSpesialisByID(request: Request, response: Response, next: NextFunction) {
        let id = await parseInt(request.params['id']);
        
        let dataSpesialisByID = await this.userRepo.count({
           id: id,
           user_type: 'admin'
        });

        if (dataSpesialisByID > 0) {
            return { "data_spesialis": await this.userRepo.findOne({
                where: {
                    id: id,
                    user_type: 'admin'
                }
            }) };
        } else {
            return { "data_spesialis": {} };
        }
    }
}