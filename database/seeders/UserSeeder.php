<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = Role::pluck('id', 'name');
        $users = array(
            array('id' => '1', 'name' => 'Feriyanto', 'email' => 'feriyanto167@gmail.com', 'role_id' => '2', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$LtmbDQXLtskLTgxVWswo0O.TyhSjMBr8QjpEJyemF85H1Hs7asn.q', 'remember_token' => NULL, 'created_at' => '2025-08-25 08:20:03', 'updated_at' => '2025-08-25 08:20:03'),
            array('id' => '2', 'name' => 'Rama', 'email' => 'ramadhans.businessmail@gmail.com', 'role_id' => '4', 'whatsAppNum' => '081359113349', 'email_verified_at' => NULL, 'password' => '$2y$12$KBv.TfFkmQ5VBbUMdHyo0eFu1a1s3/KkAgJ8X3Jc2vclEOm5MGbHW', 'remember_token' => NULL, 'created_at' => '2025-08-25 08:20:03', 'updated_at' => '2025-08-25 08:20:03'),
            array('id' => '3', 'name' => 'Johan', 'email' => 'johan@sinerco.co.id', 'role_id' => '4', 'whatsAppNum' => '082113837546', 'email_verified_at' => NULL, 'password' => '$2y$12$jcnvFFucQy1XqPvRno4VtOFSEm4ylmvK.OHquTpAyBSUKTSMM83Bu', 'remember_token' => 'lU6gTHbHgqdZW95dzRB4MsO9Zzaxz8zWNpeTxzNRfFgu0QCtQYrzdm9nA89x', 'created_at' => '2025-08-25 08:20:04', 'updated_at' => '2025-08-25 08:20:04'),
            array('id' => '4', 'name' => 'John Doe', 'email' => 'operator@sinerco.co.id', 'role_id' => '2', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$0Mo2jGgMtZqeMgV4upPD/eGa8YgA5s8KhixbpyKAnyI1jX0cNadau', 'remember_token' => 'cYcnaiX2DW1kz6IVvZl1E5dYNTY2sPzwQP2LKYboHohDVlVXW8bG0Eiy5cy8', 'created_at' => '2025-08-25 08:20:04', 'updated_at' => '2025-08-25 08:20:04'),
            array('id' => '5', 'name' => 'Budi Kentaki', 'email' => 'teknisi@sinerco.co.id', 'role_id' => '3', 'whatsAppNum' => '085921774621', 'email_verified_at' => NULL, 'password' => '$2y$12$o6wxPOcgP7EZJGkSOX0cHOSgmxVtGMkq5di8OJDC5iCoyyeQwRZ8y', 'remember_token' => 'sbmomXO67pY4O6m0yL8xdieNaHNduFkLDCUeVErh7vGWxQGiDxOjHa9ms5vk', 'created_at' => '2025-08-25 08:20:04', 'updated_at' => '2025-08-25 08:20:04'),
            array('id' => '6', 'name' => 'Client', 'email' => 'client@sinerco.co.id', 'role_id' => '5', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$NExelpUzcmsr9kf5DhjvmelyCIbTcUy2iWZ9G.W4J3lRihJknUB/.', 'remember_token' => NULL, 'created_at' => '2025-08-25 08:20:05', 'updated_at' => '2025-08-25 08:20:05'),
            array('id' => '7', 'name' => 'Manager', 'email' => 'manager@sinerco.co.id', 'role_id' => '1', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$CRNdfk2hFbrufmB9ISNPkOjCl5QRKcQx6jAfnkZweoD2Ymf7GCL3q', 'remember_token' => NULL, 'created_at' => '2025-08-25 08:20:05', 'updated_at' => '2025-08-25 08:20:05'),
            array('id' => '8', 'name' => 'General Manager', 'email' => 'general.manager@sinerco.co.id', 'role_id' => '1', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$bc1vFcdRLCoZyUyjUtms4Od2mNCJbzcvfN0pUV6SqqEubfghNGYPK', 'remember_token' => NULL, 'created_at' => '2025-08-25 08:20:05', 'updated_at' => '2025-08-25 08:20:05'),
            array('id' => '9', 'name' => 'Direksi', 'email' => 'direksi@sinerco.co.id', 'role_id' => '1', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$km32s0weVi54Um/7m3Ybs.CUJkyvU.FgLOLhcuYXqD.vAnf5HrO.q', 'remember_token' => NULL, 'created_at' => '2025-08-25 08:20:06', 'updated_at' => '2025-08-25 08:20:06'),
            array('id' => '10', 'name' => 'Jono Santoso', 'email' => 'testTeknisi@sinerco.co.id', 'role_id' => '3', 'whatsAppNum' => '081281995158', 'email_verified_at' => NULL, 'password' => '$2y$12$CIrNSku72xV3nrmmUxVuiula1oWq9ACCtTw/XLV/.mJwMFYyZRSRW', 'remember_token' => NULL, 'created_at' => '2025-08-25 08:20:06', 'updated_at' => '2025-08-25 08:20:06'),
            array('id' => '12', 'name' => 'Operator0', 'email' => 'operator0@sinerco.co.id', 'role_id' => '2', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$3vWDPeftyyQGu5uNT6/k9ORsa33DH459qoEfdIVVyxD.GmcOsez0.', 'remember_token' => 'zjF2sSNejC9zxKMu9fSJjBm8ImkBIxIUZUoOPT8leGTtkDFey6clplcI5SYd', 'created_at' => '2025-07-27 21:02:14', 'updated_at' => '2025-07-27 21:02:14'),
            array('id' => '13', 'name' => 'Operator1', 'email' => 'operator1@sinerco.co.id', 'role_id' => '2', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$jK5On6ZpOYtTH68G6MG3ruG58Dk8ljzOqsk6to7UEWxawSNfzQacq', 'remember_token' => 'rxqR20NmLlYOv2Utl3LEVXwlnl0ghe5PDc8cnhIFS3zCQNfqdNoAHLU6lKvs', 'created_at' => '2025-07-27 21:25:23', 'updated_at' => '2025-07-27 21:25:23'),
            array('id' => '14', 'name' => 'Marihot', 'email' => 'marihotgustafasitorus@gmail.com', 'role_id' => '3', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$jsz35a46QgZwnWFyE.kmCOHFdwJ7K.FeG0h2ngmZ21ny6fa/ojuW2', 'remember_token' => 'tck2MQur3irFiD2scmRUJA4eYEmmomAHoiaZbSdfK1hFTye8rlCnYC891Har', 'created_at' => '2025-07-27 21:28:41', 'updated_at' => '2025-07-27 21:28:41'),
            array('id' => '15', 'name' => 'Dian', 'email' => 'putradian876@gmail.com', 'role_id' => '3', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$AVH7Couhjyp/nD5G5rRPF.ol9nT8dztVdNxYQpRL9Z5CgMzTI4CR2', 'remember_token' => NULL, 'created_at' => '2025-07-31 21:10:18', 'updated_at' => '2025-07-31 21:10:18'),
            array('id' => '16', 'name' => 'Zem', 'email' => 'moningzem@gmail.com', 'role_id' => '3', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$y7DmlxRC2MswUkvoNfqt8e6lgZrngIn8I2YXAR31NQOtbRggNvJjy', 'remember_token' => NULL, 'created_at' => '2025-07-31 21:10:53', 'updated_at' => '2025-07-31 21:10:53'),
            array('id' => '17', 'name' => 'Arliansyah', 'email' => 'arlhyarliansyah@gmail.com', 'role_id' => '3', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$k/HwXLhqlBVqz2TRAxeXIOYOFsz1KF.dmJ2fJQ8S2GeZTPdaeUeeq', 'remember_token' => 'qScdW7V6PoefRLMCsH1lNxZfFWoN7wHlDpXYMpRPlq9nRQW9RlikTnneYnFP', 'created_at' => '2025-07-31 21:11:27', 'updated_at' => '2025-07-31 21:11:27'),
            array('id' => '18', 'name' => 'Yoshep', 'email' => 'yoshep.barcelo@gmail.com', 'role_id' => '3', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$NYbRMY8AiMrNtzcWYA3ToOMgt6dGHAQYdwaL686gCBBhP9JYsWPgW', 'remember_token' => NULL, 'created_at' => '2025-07-31 21:12:19', 'updated_at' => '2025-07-31 21:12:19'),
            array('id' => '19', 'name' => 'Rivaldi', 'email' => 'rvldi22@gmail.com', 'role_id' => '2', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$TerJTbm45BKQGB60O1cOf.h13E/uIS/K1tkGRjwAmZ97WxQ3uGDLG', 'remember_token' => NULL, 'created_at' => '2025-07-31 21:12:43', 'updated_at' => '2025-07-31 21:12:43'),
            array('id' => '20', 'name' => 'reyhan', 'email' => 'muhammadreyhandaniarta@gmail.com', 'role_id' => '2', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$Sr.NGclNDD4dT4.ICFGYfeol02K3.BAcC9l6hEi/WkZJzKlDEZ9Oy', 'remember_token' => NULL, 'created_at' => '2025-07-31 21:25:28', 'updated_at' => '2025-07-31 21:25:28'),
            array('id' => '21', 'name' => 'candra', 'email' => 'setiawancandra2001@gmail.com', 'role_id' => '2', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$8Dg2t7nuIy24q7HNo2tYxOARrYewT2a9zw6xx4rQdtltopt5kI0L6', 'remember_token' => NULL, 'created_at' => '2025-07-31 21:29:16', 'updated_at' => '2025-07-31 21:29:16'),
            array('id' => '22', 'name' => 'Abdillah', 'email' => 'afdillahi525@gmail.com', 'role_id' => '2', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$w1pH3.QF6vgLGTtF6s9YcueV1h7UXevF4vX8Jiw/PV6jh7qXlArza', 'remember_token' => 'aMOOsnab68COtB0HorZMieyznuLhsF7LOpjcJFWSbpCEIYFf7Ag12jcfNIQb', 'created_at' => '2025-07-31 21:29:33', 'updated_at' => '2025-07-31 21:29:33'),
            array('id' => '23', 'name' => 'Brayen', 'email' => 'brayendjappa@gmail.com', 'role_id' => '2', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$2xxO2TQAlIjdm4NMqRxGvOL8iHkhziLR/XN06hXMieEW1sskcJOCq', 'remember_token' => 'VVP8My9ikSH5YEfFKEiqelfqJfbW1zKZDCVs91vdSZyempg4s46F6CQ62iEW', 'created_at' => '2025-07-31 21:29:52', 'updated_at' => '2025-07-31 21:29:52'),
            array('id' => '24', 'name' => 'Dedi irawan', 'email' => 'denovirawan@gmail.com', 'role_id' => '2', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$oEScp4IIN.me2d.cR4dcTuPSf04bsA2hQSQ6vLqOhDNzJg.iE6jdK', 'remember_token' => NULL, 'created_at' => '2025-07-31 21:30:36', 'updated_at' => '2025-07-31 21:30:36'),
            array('id' => '25', 'name' => 'Muhammad Eddy Supriyanto', 'email' => 'Eddymuhammad13@gmail.com', 'role_id' => '2', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$mi0f409Wriywo.Ptq/IP9uDDYAU3exRPqYaEBGVqHdGRS5CiOAheu', 'remember_token' => NULL, 'created_at' => '2025-07-31 21:31:08', 'updated_at' => '2025-07-31 21:31:08'),
            array('id' => '26', 'name' => '⁠Bagas putra Mahendra', 'email' => 'Bagasptra20@gmail.com', 'role_id' => '2', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$tdUI0w9htcWK7rvcnk3uGOMPg/1MrSQzpF.EYesy5XvUg/e1NjKne', 'remember_token' => NULL, 'created_at' => '2025-07-31 21:32:44', 'updated_at' => '2025-07-31 21:32:44'),
            array('id' => '27', 'name' => 'Zainal', 'email' => 'zainalgasjack87@gmail.com', 'role_id' => '2', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$S7fWel2bhpYMM//P.K4.leH0PLvETWtk6h8SZTFixmqro7fAGr94q', 'remember_token' => 'Q7a0Grr1QDvQqqVLZLZD2rsBHc3DGB5bnQvM75zx3ox9fGvNhuxFrcVqpLni', 'created_at' => '2025-07-31 21:33:05', 'updated_at' => '2025-07-31 21:33:05'),
            array('id' => '28', 'name' => 'M. Nur Rizky', 'email' => 'itskyyzn@gmail.com', 'role_id' => '2', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$u2IRg//QEN/Bcr2EI.DlsuOQJpzzrkFgH4YRuqMGJVyzhV8/J5N7u', 'remember_token' => 'VFnjEZ0dh7TTCUVTRa8BsPbizPLwdDEuBuUNoGStKWPhgPdITFzX5jxYFADE', 'created_at' => '2025-07-31 21:33:31', 'updated_at' => '2025-07-31 21:33:31'),
            array('id' => '29', 'name' => 'Anton', 'email' => 'anton@coba.com', 'role_id' => '2', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$K1cfqiD0aKancU9sS1fed.v/1czTqfwKK/6rPRL.O85pZ5PWOn2Aq', 'remember_token' => 'X2q9pmSjAvDKUeY6EahdIlXGRSPxxQly7TiZJKuCRHqo4PP0Y73vzTVOAiIr', 'created_at' => '2025-07-31 21:33:50', 'updated_at' => '2025-07-31 21:33:50'),
            array('id' => '30', 'name' => 'R. A. Hadi Purnomo', 'email' => 'avianto.hadi@gmail.com', 'role_id' => '3', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$1SFmHV.XsP9vprv4C0urS./L/RtidMrlNQprPdKsPv.AF831A/Thu', 'remember_token' => NULL, 'created_at' => '2025-08-02 06:12:03', 'updated_at' => '2025-08-02 06:12:03'),
            array('id' => '31', 'name' => 'Elieser', 'email' => 'eliezereser@gmail.com', 'role_id' => '3', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$dt4eHn8ekysX2Bg09.mi/.BVyJNhppbBGRz7c/xpznY0EwlzjBBzm', 'remember_token' => NULL, 'created_at' => '2025-08-02 06:12:37', 'updated_at' => '2025-08-02 06:12:37'),
            array('id' => '32', 'name' => 'Yusuf', 'email' => '8009yusuf@gmail.com', 'role_id' => '3', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$P/UqABDEvLVuYet.jiqWvOv1wANC/LmThXd/OFcsA8k4Ik3TLQrta', 'remember_token' => NULL, 'created_at' => '2025-08-02 06:13:38', 'updated_at' => '2025-08-02 06:13:38'),
            array('id' => '33', 'name' => 'Agus Setiyono', 'email' => 'agussetiyono739@gmail.com', 'role_id' => '3', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$uqF5u.LJaM9YviuKTz7kxuz9SwpJ8XVlQ7TlOotgX/d/1kBAWkDsm', 'remember_token' => '78yJSI7e6ZrfxGXnqcT1w6GuT5iMDPBn9RfuPfOBrTkM1B1F6nHaw0kb84mR', 'created_at' => '2025-08-02 06:14:16', 'updated_at' => '2025-08-02 06:14:16'),
            array('id' => '34', 'name' => 'Ridwansyah', 'email' => 'ridwansyahwa@gmail.com', 'role_id' => '2', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$SDzlHUugZxl5qjJJycra8O2G6gFE58r0sdcn8NeM5K2CtW/pkz2/m', 'remember_token' => NULL, 'created_at' => '2025-08-02 06:14:39', 'updated_at' => '2025-08-02 06:14:39'),
            array('id' => '35', 'name' => 'Singgih Satrio W', 'email' => 'leessang761@gmail.com', 'role_id' => '2', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$lGfydP/tNV3pWabTvWKybeFTSUVgXPQFgcuUuWWjv9syXvSNDa3IK', 'remember_token' => '1PaU58tAEf9lPTyI5UOjnf1K5S2UPyyZequv133KTX3mpyZ0Hfb5SBIy9Lxs', 'created_at' => '2025-08-02 06:14:58', 'updated_at' => '2025-08-02 06:14:58'),
            array('id' => '36', 'name' => 'Taufik Hidayat', 'email' => 'taufik046@gmail.com', 'role_id' => '2', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$lSd1oddVxaOtebR0jEADUeRzVTpjRtez0G4WougzIDRzZt.uh4zVW', 'remember_token' => 'jZb5w7vxrnKuzm8AikrTMiimMS8hbRyD7A2nvvFc96CwaDHzPDUOAayCOAvg', 'created_at' => '2025-08-02 06:19:46', 'updated_at' => '2025-08-02 06:19:46'),
            array('id' => '37', 'name' => 'Erik Prayoga', 'email' => 'erikpraditya6699@gmail.com', 'role_id' => '2', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$JEB8UOG/n2RkU9HvT9oZJeZYL1GrohfgQsXijEFX/Xs6/N6RfWe0u', 'remember_token' => NULL, 'created_at' => '2025-08-02 06:20:11', 'updated_at' => '2025-08-02 06:20:11'),
            array('id' => '38', 'name' => 'Ade Putra Pratama', 'email' => 'putrappratamap@gmail.com', 'role_id' => '2', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$nBiIGuf3dAmMmFr9cuIZNeadZ0BfnqW6mdO9iNR4RC5oUfFeLOQeu', 'remember_token' => NULL, 'created_at' => '2025-08-02 06:20:36', 'updated_at' => '2025-08-02 06:20:36'),
            array('id' => '39', 'name' => 'Acherudin Noor', 'email' => 'achichau855@gmail.com', 'role_id' => '2', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$brrZ1ht4YQqBC9KXRK5/feYodQDQ8dnGmtdCoDM5XgzPQRYZTaXGy', 'remember_token' => NULL, 'created_at' => '2025-08-02 06:20:54', 'updated_at' => '2025-08-02 06:20:54'),
            array('id' => '40', 'name' => 'Prasetyo', 'email' => 'prasetyo@tes.zulu', 'role_id' => '3', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$EfIoo3Akux0YCA.tuJV3Y.beQwoaNoaYALVPVi/ZeqFAUwcmXeCyW', 'remember_token' => NULL, 'created_at' => '2025-08-04 08:53:30', 'updated_at' => '2025-08-04 08:53:30'),
            array('id' => '41', 'name' => 'Cecep Tarsidi', 'email' => 'cecep@tes.zulu', 'role_id' => '2', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$gz8Z/Cwkx/7BkfwV.55r3e4Vb86S9jbFSkdKZN9wTjqSnHCARCycm', 'remember_token' => NULL, 'created_at' => '2025-08-04 08:53:55', 'updated_at' => '2025-08-04 08:53:55'),
            array('id' => '42', 'name' => 'Sabril', 'email' => 'sabrilrayyan05@gmail.com', 'role_id' => '2', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$lBKaDz3BT4jtys3Xi3leUOfiOxZPe8SozA/GtyygSllHuoxMPdpOe', 'remember_token' => '4xz91DXscTk0TAQ5PYlLbbGKvBRhNdYQqXyXpaUqTtbMqtrzPC0cQhFVY5v7', 'created_at' => '2025-08-06 17:56:07', 'updated_at' => '2025-08-06 17:56:07'),
            array('id' => '43', 'name' => 'Praditya', 'email' => 'pradityaadit845@gmail.com', 'role_id' => '2', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$17IhUZeg9WMhFaZHbMeyQu4FWl7vZZNP1uy85qNlC15Vs.gGDrxoi', 'remember_token' => NULL, 'created_at' => '2025-08-06 17:56:36', 'updated_at' => '2025-08-06 17:56:36'),
            array('id' => '44', 'name' => 'Ahmadi', 'email' => 'ahmadigomad1@gmail.com', 'role_id' => '2', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$SXwO21uh.MdG.w4cqlcz..VlkK72W1w0jpxIE5AFXqU0q3kW.aayu', 'remember_token' => 'S2yusxXmI5sMbpY6cwELefrdrtny0ZukTi6PZunPmm0xPhB0RcjE3thRpu5M', 'created_at' => '2025-08-06 17:57:08', 'updated_at' => '2025-08-06 17:57:08'),
            array('id' => '45', 'name' => 'Mustakim', 'email' => 'musstakim.mt@gmail.com', 'role_id' => '2', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$vgZVsiAkTujg2T2yYRziG.IjUHsdY6jJ8BEvmJx55z5LS5pU/Vbli', 'remember_token' => NULL, 'created_at' => '2025-08-06 17:57:24', 'updated_at' => '2025-08-06 17:57:24'),
            array('id' => '46', 'name' => 'Pariji', 'email' => 'ahmadpariji522@gmail.com', 'role_id' => '2', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$Y3WiYahW4WEZ1MIiXerPiugCCKe0ZqWwmWU.hRqMMRcOM60ITOG4G', 'remember_token' => NULL, 'created_at' => '2025-08-06 17:57:42', 'updated_at' => '2025-08-06 17:57:42'),
            array('id' => '47', 'name' => 'Tatang', 'email' => 'tatangmadih93@gmail.com', 'role_id' => '2', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$SxXL3bp..1SBagAYDVWhmex1pAYW1ARh/6uK1ZcLroU4pm5QIjcOi', 'remember_token' => NULL, 'created_at' => '2025-08-06 17:57:58', 'updated_at' => '2025-08-06 17:57:58'),
            array('id' => '48', 'name' => 'Nuralih', 'email' => 'akewnuralih@gmail.com', 'role_id' => '2', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$GJTD5xB3vsp7vLe0EdG2seTZewY9Bh5RGdvyu7SWz2.FyYovJQ8t2', 'remember_token' => '0CKxtzpiFiCp9jjN3iT2rpUgPWgZ23Rg3eL4lmOSefqPtlNY9czZsMNvOOrp', 'created_at' => '2025-08-06 17:58:12', 'updated_at' => '2025-08-06 17:58:12'),
            array('id' => '49', 'name' => 'Nayah', 'email' => 'nayahnksr248@gmail.com', 'role_id' => '2', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$eSx.MEEuTMLsso/4V6lGlezR3pF2tWhKGqBEwp4AWgmRjNpllssuK', 'remember_token' => 'J6u9siH6aB2JGkWyidqe83BAopR3HoafqqNuxx8NN4JfpG1AmioDNMCGAFqy', 'created_at' => '2025-08-06 17:58:30', 'updated_at' => '2025-08-06 17:58:30'),
            array('id' => '50', 'name' => 'Kusuma', 'email' => 'ijayakusuma460@gmail.com', 'role_id' => '2', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$QGJCDtbawRV6eC47sYqBMeW41lWMni9V2kOTGXfM5Bgv0uW7RfOme', 'remember_token' => NULL, 'created_at' => '2025-08-06 17:58:46', 'updated_at' => '2025-08-06 17:58:46'),
            array('id' => '51', 'name' => 'Ismail', 'email' => 'ismail@tes.com', 'role_id' => '3', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$qZ2VDb4z4E6.AsOMGL4rJOUdHMMoZDi9eXwouf1D5ZRTPHcbEs0Ke', 'remember_token' => NULL, 'created_at' => '2025-08-06 21:27:44', 'updated_at' => '2025-08-06 21:27:44'),
            array('id' => '52', 'name' => 'Cool Vega', 'email' => 'vega@tes.id', 'role_id' => '2', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$4oYG.VLGH1jC1blx7bqQb.Y4e4qKgJJmDeHgIqx.DSKs/87xZ0K3G', 'remember_token' => NULL, 'created_at' => '2025-08-07 21:20:35', 'updated_at' => '2025-08-07 21:20:35'),
            array('id' => '53', 'name' => 'Dandi', 'email' => 'dandi@sinerco.co.id', 'role_id' => '3', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$B2zOQdKOT8S6cbR8.LLHheOU90A1lWDYMmSqCc7Isp75bmc9fX9xm', 'remember_token' => NULL, 'created_at' => '2025-09-01 06:55:15', 'updated_at' => '2025-09-01 06:55:15'),
            array('id' => '54', 'name' => 'Rasyapetir', 'email' => 'rasyafazzlah@gmail.com', 'role_id' => '2', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$B0O.KYE6gVyO64bRv0GejOFnbhlV78sOCORgV9JtNQ6Xpem.5PrPW', 'remember_token' => NULL, 'created_at' => '2025-09-03 23:26:44', 'updated_at' => '2025-09-03 23:26:44'),
            array('id' => '55', 'name' => 'Robet Pakpahan', 'email' => 'pakpahanrobet@gmail.com', 'role_id' => '3', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$FPx5Gsju4i89SoPEyczg7.G7CAm6ZanwInWmwUxiM8RepWXV0ebOm', 'remember_token' => 'Yx9WwtMm5AXErEz0IeLxy3su7swFji6P1qK9KkecxOuWYcudov11TNFbXa1r', 'created_at' => '2025-09-04 02:00:23', 'updated_at' => '2025-09-04 02:00:23'),
            array('id' => '56', 'name' => 'Karnedi', 'email' => 'nedik4132@gmail.com', 'role_id' => '2', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$byTz9duyu0QVebmjqOr0Q.poqoEenXLWxK5vA29GL3R0gydURjDay', 'remember_token' => 'CY1tesRUzr0iH9Z4QBdAwNRfWGSkLkvmZsIXGZAkHA0VBl9xQQArdwgf4j9L', 'created_at' => '2025-09-04 02:00:46', 'updated_at' => '2025-09-04 02:00:46'),
            array('id' => '57', 'name' => 'Rizal', 'email' => 'rizal45mm@gmail.com', 'role_id' => '2', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$JdNDOuFwjXzv3DpwfBqn1.4G4LQrAEE9wOxPGZHvYLG5JSLNTETgi', 'remember_token' => 'LwlfLLbamX0Rij7UrGLyTz78n3VC0QXI0blsgad1mTq4yoitZL8Qb3iPYt7i', 'created_at' => '2025-09-04 02:01:55', 'updated_at' => '2025-09-04 02:01:55'),
            array('id' => '58', 'name' => 'Mirhadi', 'email' => 'mirhadi01234@gmail.com', 'role_id' => '2', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$wdx2o8/Ir6kbznFq93V.0OyE9RM8tMiDHpioKvIUUZ6Q/rkHZc9ui', 'remember_token' => NULL, 'created_at' => '2025-09-04 02:02:13', 'updated_at' => '2025-09-04 02:02:13'),
            array('id' => '59', 'name' => 'Yudi Sepriyanto', 'email' => 'yudi.sepriyanto09@gmail.com', 'role_id' => '3', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$E8nogbHYUvraoGHvukhnWOkk5UlgtvSxEpnKJ2QSWjUOXCgcyfgGq', 'remember_token' => 'R2o0lcHoRg3NZPh8nvXArACmWaFw3uDWWQ6DEX07NTpGocnbUJpj9gse1ffj', 'created_at' => '2025-09-04 02:02:30', 'updated_at' => '2025-09-04 02:02:30'),
            array('id' => '60', 'name' => 'Rifqi Nandihariansyah', 'email' => 'rifqinandihariansyah46@gmail.com', 'role_id' => '1', 'whatsAppNum' => NULL, 'email_verified_at' => NULL, 'password' => '$2y$12$GpJl1BR.pYZkDRc0HfFd3uUOTcLIYwbcw8okPuU7jd1UXPEMSWj7a', 'remember_token' => NULL, 'created_at' => '2025-09-08 02:44:12', 'updated_at' => '2025-09-08 02:44:12')
        );

        foreach ($users as $user) {
            User::updateOrCreate(
                ['email' => $user['email']],
                [
                    'name' => $user['name'],
                    'password' => $user['password'],
                    'role_id' => $user['role_id'],
                    'whatsAppNum' => $user['whatsAppNum'],
                ],
            );
        }
        // User::updateOrCreate(
        //     ['email' => 'feriyanto167@gmail.com'],
        //     [
        //         'name' => 'Feriyanto',
        //         'password' => Hash::make('password12345'),
        //         'role_id' => $roles['operator'] ?? null,
        //         // 'whatsAppNum' => '081359113349',
        //     ],
        // );

        // User::updateOrCreate(
        //     ['email' => 'ramadhans.businessmail@gmail.com'],
        //     [
        //         'name' => 'Rama',
        //         'password' => Hash::make('admin12345'),
        //         'role_id' => $roles['super_admin'] ?? null,
        //         'whatsAppNum' => '081359113349',
        //     ],
        // );

        // User::updateOrCreate(
        //     ['email' => 'johan@sinerco.co.id'],
        //     [
        //         'name' => 'Johan',
        //         'password' => Hash::make('admin12345'),
        //         'role_id' => $roles['super_admin'] ?? null,
        //         'whatsAppNum' => '082113837546',
        //     ],
        // );

        // User::updateOrCreate(
        //     ['email' => 'operator@sinerco.co.id'],
        //     [
        //         'name' => 'John Doe',
        //         'password' => Hash::make('operator12345'),
        //         'role_id' => $roles['operator'] ?? null,
        //     ],
        // );

        // User::updateOrCreate(
        //     ['email' => 'teknisi@sinerco.co.id'],
        //     [
        //         'name' => 'Budi Kentaki',
        //         'password' => Hash::make('teknisi12345'),
        //         'role_id' => $roles['technician'] ?? null,
        //         'whatsAppNum' => '085921774621',
        //     ],
        // );

        // User::updateOrCreate(
        //     ['email' => 'client@sinerco.co.id'],
        //     [
        //         'name' => 'Client',
        //         'password' => Hash::make('client12345'),
        //         'role_id' => $roles['client'] ?? null,
        //     ],
        // );

        // User::updateOrCreate(
        //     ['email' => 'manager@sinerco.co.id'],
        //     [
        //         'name' => 'Manager',
        //         'password' => Hash::make('manager12345'),
        //         'role_id' => $roles['guest'] ?? null,
        //     ],
        // );

        // User::updateOrCreate(
        //     ['email' => 'general.manager@sinerco.co.id'],
        //     [
        //         'name' => 'General Manager',
        //         'password' => Hash::make('general.manager12345'),
        //         'role_id' => $roles['guest'] ?? null,
        //     ],
        // );

        // User::updateOrCreate(
        //     ['email' => 'direksi@sinerco.co.id'],
        //     [
        //         'name' => 'Direksi',
        //         'password' => Hash::make('direksi12345'),
        //         'role_id' => $roles['guest'] ?? null,
        //     ],
        // );

        // User::updateOrCreate(
        //     ['email' => 'testTeknisi@sinerco.co.id'],
        //     [
        //         'name' => 'Jono Santoso',
        //         'password' => Hash::make('direksi12345'),
        //         'whatsAppNum' => '081281995158',
        //         'role_id' => $roles['technician'] ?? null,
        //     ],
        // );
    }

}
