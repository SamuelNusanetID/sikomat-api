import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class LogActivity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        nullable: true,
    })
    user_id: string;

    @Column({
        nullable: true,
    })
    log_name: string;
}


