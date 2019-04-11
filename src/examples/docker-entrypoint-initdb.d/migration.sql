--
-- PostgreSQL database dump
--

-- Dumped from database version 10.5 (Debian 10.5-2.pgdg90+1)
-- Dumped by pg_dump version 11.2

-- Started on 2019-04-03 10:59:00 UTC

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 8 (class 2615 OID 16999)
-- Name: adm; Type: SCHEMA; Schema: -; Owner: test
--

CREATE SCHEMA adm;


ALTER SCHEMA adm OWNER TO test;

--
-- TOC entry 4 (class 2615 OID 17000)
-- Name: pim; Type: SCHEMA; Schema: -; Owner: test
--

CREATE SCHEMA pim;


ALTER SCHEMA pim OWNER TO test;

SET default_tablespace = '';

SET default_with_oids = false;


CREATE SEQUENCE adm.admusr_seq;
CREATE SEQUENCE pim.pimpjt_seq;
CREATE SEQUENCE public.pubpost_seq;

--
-- TOC entry 198 (class 1259 OID 17004)
-- Name: AdmUsr; Type: TABLE; Schema: adm; Owner: test
--

CREATE TABLE adm."AdmUsr" (
    id integer NOT NULL DEFAULT nextval('adm.admusr_seq'),
    username character varying(50) NOT NULL,
    email character varying(255) NOT NULL
);


ALTER TABLE adm."AdmUsr" OWNER TO test;

--
-- TOC entry 199 (class 1259 OID 17009)
-- Name: PimPjt; Type: TABLE; Schema: pim; Owner: test
--

CREATE TABLE pim."PimPjt" (
    id integer NOT NULL DEFAULT nextval('pim.pimpjt_seq'),
    name character varying(255) NOT NULL,
    description text
);


ALTER TABLE pim."PimPjt" OWNER TO test;

--
-- TOC entry 2870 (class 0 OID 0)
-- Dependencies: 199
-- Name: TABLE "PimPjt"; Type: COMMENT; Schema: pim; Owner: test
--

COMMENT ON TABLE pim."PimPjt" IS 'Project';


--
-- TOC entry 200 (class 1259 OID 17017)
-- Name: PubPost; Type: TABLE; Schema: public; Owner: test
--

CREATE TABLE public."PubPost" (
    id integer  NOT NULL DEFAULT nextval('public.pubpost_seq'),
    title character varying(255) NOT NULL,
    content text
);


ALTER TABLE public."PubPost" OWNER TO test;


ALTER SEQUENCE adm.admusr_seq
OWNED BY adm."AdmUsr"."id";

ALTER SEQUENCE pim.pimpjt_seq
OWNED BY pim."PimPjt"."id";

ALTER SEQUENCE public.pubpost_seq
OWNED BY public."PubPost"."id";

--
-- TOC entry 2862 (class 0 OID 17004)
-- Dependencies: 198
-- Data for Name: AdmUsr; Type: TABLE DATA; Schema: adm; Owner: test
--

COPY adm."AdmUsr" (id, username, email) FROM stdin;
1	lucduong	luc@ltv.vn
2	anhle	anh@ltv.vn
\.


--
-- TOC entry 2863 (class 0 OID 17009)
-- Dependencies: 199
-- Data for Name: PimPjt; Type: TABLE DATA; Schema: pim; Owner: test
--

COPY pim."PimPjt" (id, name, description) FROM stdin;
1	Moleculer	Moleculer Microservices
2	Moleculer Postgraphile	Moleculer Postgraphile for creating postgraphile action
\.


--
-- TOC entry 2736 (class 2606 OID 17008)
-- Name: AdmUsr AdmUsr_PK; Type: CONSTRAINT; Schema: adm; Owner: test
--

ALTER TABLE ONLY adm."AdmUsr"
    ADD CONSTRAINT "AdmUsr_PK" PRIMARY KEY (id);


--
-- TOC entry 2738 (class 2606 OID 17016)
-- Name: PimPjt PimPjt_PK; Type: CONSTRAINT; Schema: pim; Owner: test
--

ALTER TABLE ONLY pim."PimPjt"
    ADD CONSTRAINT "PimPjt_PK" PRIMARY KEY (id);


--
-- TOC entry 2740 (class 2606 OID 17024)
-- Name: PubPost id; Type: CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public."PubPost"
    ADD CONSTRAINT id PRIMARY KEY (id);


-- Completed on 2019-04-03 10:59:00 UTC

--
-- PostgreSQL database dump complete
--

