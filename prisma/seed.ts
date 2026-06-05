import { PrismaClient, CarKategori, GearType, BreendstofType, CarStatus, BookingStatus, BetalingStatus, PaymentMethod, PaymentStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeder database...')

  await prisma.damage.deleteMany()
  await prisma.inspection.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.contract.deleteMany()
  await prisma.bookingExtra.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.carImage.deleteMany()
  await prisma.car.deleteMany()
  await prisma.customer.deleteMany()

  const cars = await Promise.all([
    prisma.car.create({ data: { navn: 'VW Polo', reg_nr: 'AB 12 345', kategori: CarKategori.LILLE, gear: GearType.MANUEL, braendstof: BreendstofType.BENZIN, saeder: 5, pris_dag: 299, status: CarStatus.LEDIG, beskrivelse: 'Kvik og økonomisk bybil — perfekt til byture og pendling.' } }),
    prisma.car.create({ data: { navn: 'Toyota Yaris', reg_nr: 'CD 23 456', kategori: CarKategori.LILLE, gear: GearType.AUTOMATIK, braendstof: BreendstofType.HYBRID, saeder: 5, pris_dag: 349, status: CarStatus.LEDIG, beskrivelse: 'Hybrid med ekstra lavt brændstofforbrug og nem automatgear.' } }),
    prisma.car.create({ data: { navn: 'Ford Fiesta', reg_nr: 'EF 34 567', kategori: CarKategori.LILLE, gear: GearType.MANUEL, braendstof: BreendstofType.BENZIN, saeder: 5, pris_dag: 279, status: CarStatus.LEDIG, beskrivelse: 'Billig og driftsikker lillebil — vores skarpeste dagspris.' } }),
    prisma.car.create({ data: { navn: 'VW Golf', reg_nr: 'GH 45 678', kategori: CarKategori.MELLEMKLASSE, gear: GearType.AUTOMATIK, braendstof: BreendstofType.BENZIN, saeder: 5, pris_dag: 449, status: CarStatus.LEDIG, beskrivelse: 'Komfortabel allrounder til både by og længere ture.' } }),
    prisma.car.create({ data: { navn: 'Kia Ceed', reg_nr: 'IJ 56 789', kategori: CarKategori.MELLEMKLASSE, gear: GearType.MANUEL, braendstof: BreendstofType.BENZIN, saeder: 5, pris_dag: 429, status: CarStatus.LEDIG, beskrivelse: 'Veludstyret mellemklasse med god plads og lavt forbrug.' } }),
    prisma.car.create({ data: { navn: 'Skoda Octavia', reg_nr: 'KL 67 890', kategori: CarKategori.STATIONCAR, gear: GearType.AUTOMATIK, braendstof: BreendstofType.DIESEL, saeder: 5, pris_dag: 499, status: CarStatus.RESERVERET, beskrivelse: 'Rummelig stationcar med plads til familie og bagage.' } }),
    prisma.car.create({ data: { navn: 'VW Passat', reg_nr: 'MN 78 901', kategori: CarKategori.STATIONCAR, gear: GearType.AUTOMATIK, braendstof: BreendstofType.DIESEL, saeder: 5, pris_dag: 549, status: CarStatus.LEDIG, beskrivelse: 'Premium stationcar — ideel til erhverv og længere køreture.' } }),
    prisma.car.create({ data: { navn: 'Tesla Model 3', reg_nr: 'OP 89 012', kategori: CarKategori.EL, gear: GearType.AUTOMATIK, braendstof: BreendstofType.EL, saeder: 5, pris_dag: 699, status: CarStatus.UDLEJET, beskrivelse: 'Elbil med lang rækkevidde og hurtig opladning inkluderet.' } }),
    prisma.car.create({ data: { navn: 'VW Transporter', reg_nr: 'QR 90 123', kategori: CarKategori.VAREBIL, gear: GearType.MANUEL, braendstof: BreendstofType.DIESEL, saeder: 3, pris_dag: 599, status: CarStatus.UDLEJET, beskrivelse: 'Stor varebil — ideel til flytning og transport af møbler.' } }),
    prisma.car.create({ data: { navn: 'Ford Transit', reg_nr: 'ST 01 234', kategori: CarKategori.VAREBIL, gear: GearType.MANUEL, braendstof: BreendstofType.DIESEL, saeder: 3, pris_dag: 649, status: CarStatus.LEDIG, beskrivelse: 'Rummelig kassevogn med højt tag — masser af lastplads.' } }),
    prisma.car.create({ data: { navn: 'Renault Master', reg_nr: 'UV 12 345', kategori: CarKategori.VAREBIL, gear: GearType.MANUEL, braendstof: BreendstofType.DIESEL, saeder: 3, pris_dag: 749, status: CarStatus.RESERVERET, beskrivelse: 'Vores største varebil til store flytninger og paller.' } }),
  ])

  const customers = await Promise.all([
    prisma.customer.create({ data: { navn: 'Anna Sørensen', email: 'anna@email.dk', telefon: '+45 22 33 44 55', adresse: 'Bygaden 8', postnr: '3650', by: 'Ølstykke', koerekort_verificeret: true } }),
    prisma.customer.create({ data: { navn: 'Jens Holm', email: 'jens.holm@firma.dk', telefon: '+45 30 12 88 90', adresse: 'Markvej 3', postnr: '3650', by: 'Ølstykke', koerekort_verificeret: true } }),
    prisma.customer.create({ data: { navn: 'Mette Vinter', email: 'mette.v@email.dk', telefon: '+45 26 55 41 09', adresse: 'Skovvej 14', postnr: '3650', by: 'Ølstykke', koerekort_verificeret: false } }),
    prisma.customer.create({ data: { navn: 'Peter Lund', email: 'p.lund@mail.dk', telefon: '+45 21 09 77 34', adresse: 'Birkevej 22', postnr: '3650', by: 'Ølstykke', koerekort_verificeret: true } }),
    prisma.customer.create({ data: { navn: 'Sofie Berg', email: 'sofie@berg.dk', telefon: '+45 24 18 60 52', adresse: 'Rosenvej 5', postnr: '3650', by: 'Ølstykke', koerekort_verificeret: true } }),
    prisma.customer.create({ data: { navn: 'Klaus Møller', email: 'klaus.m@email.dk', telefon: '+45 28 73 19 45', adresse: 'Elmevej 9', postnr: '3650', by: 'Ølstykke', koerekort_verificeret: false } }),
    prisma.customer.create({ data: { navn: 'Lars Mikkelsen', email: 'lars.m@bygma.dk', telefon: '+45 22 41 06 83', adresse: 'Industrivej 44', postnr: '3650', by: 'Ølstykke', koerekort_verificeret: true } }),
  ])

  const [anna, jens, mette, peter, sofie, klaus, lars] = customers
  const [polo, yaris, , golf, , octavia, , tesla, transporter, , master] = cars

  function nextBookingNr(n: number) {
    return `LB-2026-${String(n).padStart(4, '0')}`
  }

  await Promise.all([
    prisma.booking.create({
      data: {
        booking_nr: nextBookingNr(463), customer_id: anna.id, car_id: polo.id,
        start: new Date('2026-06-08T09:00:00'), slut: new Date('2026-06-10T09:00:00'),
        status: BookingStatus.BEKRAEFTET, total_pris: 776, betalingsstatus: BetalingStatus.BETALT,
        payments: { create: { beloeb: 776, metode: PaymentMethod.MOBILEPAY, status: PaymentStatus.BETALT, transaktion_id: 'QP-100001' } },
      },
    }),
    prisma.booking.create({
      data: {
        booking_nr: nextBookingNr(462), customer_id: jens.id, car_id: transporter.id,
        start: new Date('2026-06-06T08:00:00'), slut: new Date('2026-06-07T17:00:00'),
        status: BookingStatus.UDLEJET, total_pris: 1198, betalingsstatus: BetalingStatus.BETALT,
        payments: { create: { beloeb: 1198, metode: PaymentMethod.KORT, status: PaymentStatus.BETALT, transaktion_id: 'QP-100002' } },
      },
    }),
    prisma.booking.create({
      data: {
        booking_nr: nextBookingNr(461), customer_id: mette.id, car_id: tesla.id,
        start: new Date('2026-06-09T09:00:00'), slut: new Date('2026-06-12T09:00:00'),
        status: BookingStatus.BEKRAEFTET, total_pris: 2097, betalingsstatus: BetalingStatus.AFVENTER,
      },
    }),
    prisma.booking.create({
      data: {
        booking_nr: nextBookingNr(460), customer_id: peter.id, car_id: octavia.id,
        start: new Date('2026-06-05T09:00:00'), slut: new Date('2026-06-06T09:00:00'),
        status: BookingStatus.AFSLUTTET, total_pris: 499, betalingsstatus: BetalingStatus.BETALT,
        payments: { create: { beloeb: 499, metode: PaymentMethod.MOBILEPAY, status: PaymentStatus.BETALT, transaktion_id: 'QP-100003' } },
      },
    }),
    prisma.booking.create({
      data: {
        booking_nr: nextBookingNr(459), customer_id: sofie.id, car_id: yaris.id,
        start: new Date('2026-06-11T10:30:00'), slut: new Date('2026-06-14T10:30:00'),
        status: BookingStatus.BEKRAEFTET, total_pris: 1047, betalingsstatus: BetalingStatus.BETALT,
        payments: { create: { beloeb: 1047, metode: PaymentMethod.KORT, status: PaymentStatus.BETALT, transaktion_id: 'QP-100004' } },
      },
    }),
    prisma.booking.create({
      data: {
        booking_nr: nextBookingNr(464), customer_id: klaus.id, car_id: octavia.id,
        start: new Date('2026-06-12T09:00:00'), slut: new Date('2026-06-13T09:00:00'),
        status: BookingStatus.BEKRAEFTET, total_pris: 499, betalingsstatus: BetalingStatus.AFVENTER,
      },
    }),
    prisma.booking.create({
      data: {
        booking_nr: nextBookingNr(465), customer_id: lars.id, car_id: master.id,
        start: new Date('2026-06-13T09:00:00'), slut: new Date('2026-06-15T09:00:00'),
        status: BookingStatus.BEKRAEFTET, total_pris: 1498, betalingsstatus: BetalingStatus.AFVENTER,
      },
    }),
    prisma.booking.create({
      data: {
        booking_nr: nextBookingNr(458), customer_id: lars.id, car_id: tesla.id,
        start: new Date('2026-06-04T09:00:00'), slut: new Date('2026-06-06T09:00:00'),
        status: BookingStatus.UDLEJET, total_pris: 1398, betalingsstatus: BetalingStatus.BETALT,
        payments: { create: { beloeb: 1398, metode: PaymentMethod.KORT, status: PaymentStatus.BETALT, transaktion_id: 'QP-100005' } },
      },
    }),
    prisma.booking.create({
      data: {
        booking_nr: nextBookingNr(457), customer_id: anna.id, car_id: golf.id,
        start: new Date('2026-03-18T09:00:00'), slut: new Date('2026-03-21T09:00:00'),
        status: BookingStatus.AFSLUTTET, total_pris: 1347, betalingsstatus: BetalingStatus.BETALT,
        payments: { create: { beloeb: 1347, metode: PaymentMethod.MOBILEPAY, status: PaymentStatus.BETALT, transaktion_id: 'QP-100006' } },
      },
    }),
  ])

  console.log(`✓ ${cars.length} biler oprettet`)
  console.log(`✓ ${customers.length} kunder oprettet`)
  console.log('✓ Eksempel-bookinger oprettet')
  console.log('Database seedet korrekt!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
