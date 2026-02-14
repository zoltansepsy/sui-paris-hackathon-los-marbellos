# SuiPatron — Product Breakdown Structure and Roadmap

**Project:** SuiPatron (Decentralized Creator Support Platform)  
**Timeline:** MVP (hackathon)  
**Tech Stack:** Move (SUI), React + Vite, Enoki zkLogin, SEAL, Walrus  
**Version:** 1.0  
**Last Updated:** February 2025  
**Reference:** [SCOPE.md](../SCOPE.md) Section 8, [core-planning/01-product-breakdown.md](../core-planning/01-product-breakdown.md)

---

## MVP Goal

SuiPatron MVP is a functional decentralized Patreon-like platform: creators create profiles, set a flat access price, upload encrypted content (SEAL + Walrus), and supporters pay once for permanent access. All transactions are sponsored via Enoki zkLogin (Google sign-in, no wallet). Content access is enforced on-chain via AccessPass NFTs and SEAL.

---

## PBS — Smart Contract + Backend

| ID | Task | Status | Phase |
|----|------|--------|-------|
| A1 | Write Move package: Platform, AdminCap, init | [x] | 1 |
| A2 | Write: CreatorProfile, create_profile (flat price) | [x] | 1 |
| A3 | Write: AccessPass, purchase_access | [x] | 1 |
| A4 | Write: Content, publish_content (dynamic object fields) | [x] | 1 |
| A5 | Write: withdraw_earnings | [x] | 1 |
| A6 | Write: seal_policy::seal_approve | [x] | 2 |
| A7 | Write: All events | [x] | 2 |
| A8 | Write + run Move unit tests | [x] | 2 |
| A9 | Deploy package to SUI Testnet | [ ] | 2 |
| A10 | Backend: sponsor endpoint | [ ] | 2 |
| A11 | Backend: subname endpoint | [ ] | 3 |
| A12 | Backend: event indexer | [ ] | 3 |
| A13 | Version tracking + migrate function | [x] | 3 |

---

## PBS — Full-Stack Integration

| ID | Task | Status | Phase |
|----|------|--------|-------|
| P1 | Enoki zkLogin: Google sign-in flow | [x] | 1 |
| P2 | Auth callback handling + redirect | [x] | 1 |
| P3 | Transaction builder: create_profile PTB | [x] | 2 |
| P4 | Transaction builder: purchase_access PTB | [x] | 2 |
| P5 | Enoki sponsored transaction execution | [x] | 2 |
| P6 | SEAL encryption pipeline | [x] | 2 |
| P7 | Walrus upload pipeline | [x] | 2 |
| P8 | Content upload flow (encrypt → upload → publish tx) | [x] | 2 |
| P9 | Walrus download pipeline | [x] | 3 |
| P10 | SEAL decryption pipeline | [x] | 3 |
| P11 | Content access flow (download → decrypt → render) | [x] | 3 |
| P12 | SuiNS subname creation | [ ] | 3 |
| P13 | Transaction builder: withdraw_earnings PTB | [x] | 3 |
| P14 | User's AccessPass fetching + caching | [x] | 2 |

---

## PBS — UI/UX + Frontend

| ID | Task | Status | Phase |
|----|------|--------|-------|
| J1 | Design system: Button, Card, Modal, Badge, Toast | [x] | 1 |
| J2 | Layout: Header, navigation, responsive shell | [x] | 1 |
| J3 | Landing page: hero, features, CTA | [x] | 1 |
| J4 | Explore page: creator grid | [x] | 1 |
| J5 | Creator Profile page: header, price, content grid | [x] | 2 |
| J6 | Support modal: payment confirmation UI | [x] | 2 |
| J7 | Creator Dashboard: profile editor, price setting | [x] | 2 |
| J8 | Content uploader: file picker, metadata form | [x] | 2 |
| J9 | Content viewer: image, text, PDF renderers | [x] | 3 |
| J10 | Supporter feed: subscriptions list, content feed | [x] | 3 |
| J11 | Loading states, skeleton screens | [x] | 3 |
| J12 | Error toasts, empty states | [x] | 3 |
| J13 | Demo data seeding + demo polish | [ ] | 4 |

---

## PBS — Architecture + DevOps

| ID | Task | Status | Phase |
|----|------|--------|-------|
| Z1 | Scaffold monorepo: frontend, move package | [x] | 1 |
| Z2 | Configure Vercel deployment | [x] | 1 |
| Z3 | Environment configuration | [x] | 1 |
| Z4 | Enoki Portal setup | [ ] | 1 |
| Z5 | SuiNS domain registration (testnet) | [ ] | 1 |
| Z6 | Integration testing: sign in → create profile → upload | [ ] | 3 |
| Z7 | Integration testing: browse → subscribe → decrypt | [ ] | 3 |
| Z8 | Seed demo data | [ ] | 4 |
| Z9 | Demo script writing | [ ] | 4 |
| Z10 | Bug bash + final fixes | [ ] | 4 |

---

## Roadmap Summary

| Phase | Hours | Focus |
|-------|-------|-------|
| 1 | 0–4 | Foundation: scaffold, Move compile, zkLogin, UI shell |
| 2 | 4–10 | Core flows: profile, content upload, purchase |
| 3 | 10–16 | Content access, withdraw, SuiNS, indexer |
| 4 | 16–20 | Demo polish, seed data, presentation |
