import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Province } from './province.entity';
import { Listing } from '../../listings/entities/listing.entity';

@Entity()
export class District {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    slug: string;

    @ManyToOne(() => Province, province => province.districts)
    province: Province;

    @OneToMany(() => Listing, listing => listing.district)
    listings: Listing[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 