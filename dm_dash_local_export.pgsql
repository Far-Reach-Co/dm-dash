--
-- PostgreSQL database dump
--

-- Dumped from database version 14.6 (Homebrew)
-- Dumped by pg_dump version 14.6 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Clock; Type: TABLE; Schema: public; Owner: julianranieri
--

CREATE TABLE public."Clock" (
    id integer NOT NULL,
    title character varying NOT NULL,
    current_time_in_milliseconds integer NOT NULL,
    uuid character varying NOT NULL
);


ALTER TABLE public."Clock" OWNER TO julianranieri;

--
-- Name: Clock_id_seq; Type: SEQUENCE; Schema: public; Owner: julianranieri
--

CREATE SEQUENCE public."Clock_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Clock_id_seq" OWNER TO julianranieri;

--
-- Name: Clock_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: julianranieri
--

ALTER SEQUENCE public."Clock_id_seq" OWNED BY public."Clock".id;


--
-- Name: Project; Type: TABLE; Schema: public; Owner: julianranieri
--

CREATE TABLE public."Project" (
    id integer NOT NULL,
    title character varying(100) NOT NULL,
    user_id integer NOT NULL,
    date_created date DEFAULT now() NOT NULL
);


ALTER TABLE public."Project" OWNER TO julianranieri;

--
-- Name: ProjectModule; Type: TABLE; Schema: public; Owner: julianranieri
--

CREATE TABLE public."ProjectModule" (
    id integer NOT NULL,
    project_id integer NOT NULL,
    module_uuid character varying NOT NULL,
    type character varying NOT NULL
);


ALTER TABLE public."ProjectModule" OWNER TO julianranieri;

--
-- Name: ProjectModule_id_seq; Type: SEQUENCE; Schema: public; Owner: julianranieri
--

CREATE SEQUENCE public."ProjectModule_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."ProjectModule_id_seq" OWNER TO julianranieri;

--
-- Name: ProjectModule_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: julianranieri
--

ALTER SEQUENCE public."ProjectModule_id_seq" OWNED BY public."ProjectModule".id;


--
-- Name: Project_id_seq; Type: SEQUENCE; Schema: public; Owner: julianranieri
--

CREATE SEQUENCE public."Project_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Project_id_seq" OWNER TO julianranieri;

--
-- Name: Project_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: julianranieri
--

ALTER SEQUENCE public."Project_id_seq" OWNED BY public."Project".id;


--
-- Name: User; Type: TABLE; Schema: public; Owner: julianranieri
--

CREATE TABLE public."User" (
    id integer NOT NULL,
    email character varying NOT NULL,
    password character varying NOT NULL
);


ALTER TABLE public."User" OWNER TO julianranieri;

--
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: julianranieri
--

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."User_id_seq" OWNER TO julianranieri;

--
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: julianranieri
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- Name: Clock id; Type: DEFAULT; Schema: public; Owner: julianranieri
--

ALTER TABLE ONLY public."Clock" ALTER COLUMN id SET DEFAULT nextval('public."Clock_id_seq"'::regclass);


--
-- Name: Project id; Type: DEFAULT; Schema: public; Owner: julianranieri
--

ALTER TABLE ONLY public."Project" ALTER COLUMN id SET DEFAULT nextval('public."Project_id_seq"'::regclass);


--
-- Name: ProjectModule id; Type: DEFAULT; Schema: public; Owner: julianranieri
--

ALTER TABLE ONLY public."ProjectModule" ALTER COLUMN id SET DEFAULT nextval('public."ProjectModule_id_seq"'::regclass);


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: julianranieri
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Data for Name: Clock; Type: TABLE DATA; Schema: public; Owner: julianranieri
--

COPY public."Clock" (id, title, current_time_in_milliseconds, uuid) FROM stdin;
15	Wyrld Clock	0	de9ebe06-b7df-4168-9a56-8f64723aa9e1
\.


--
-- Data for Name: Project; Type: TABLE DATA; Schema: public; Owner: julianranieri
--

COPY public."Project" (id, title, user_id, date_created) FROM stdin;
11	My Project 1	49	2022-12-06
\.


--
-- Data for Name: ProjectModule; Type: TABLE DATA; Schema: public; Owner: julianranieri
--

COPY public."ProjectModule" (id, project_id, module_uuid, type) FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: julianranieri
--

COPY public."User" (id, email, password) FROM stdin;
48	jules@mail.com	$2b$10$jI5QnoOPrcQrzgMuj7zx0OOp5jA4D8046v8LOz1IXEkQNPMHkuDtG
49	admin	$2b$10$.GoksSZvUXJD2rpc33eJMu.9HnI8ENNkNkiciJyG07qOQM8psrWO2
\.


--
-- Name: Clock_id_seq; Type: SEQUENCE SET; Schema: public; Owner: julianranieri
--

SELECT pg_catalog.setval('public."Clock_id_seq"', 15, true);


--
-- Name: ProjectModule_id_seq; Type: SEQUENCE SET; Schema: public; Owner: julianranieri
--

SELECT pg_catalog.setval('public."ProjectModule_id_seq"', 1, false);


--
-- Name: Project_id_seq; Type: SEQUENCE SET; Schema: public; Owner: julianranieri
--

SELECT pg_catalog.setval('public."Project_id_seq"', 11, true);


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: julianranieri
--

SELECT pg_catalog.setval('public."User_id_seq"', 52, true);


--
-- Name: Clock Clock_pkey; Type: CONSTRAINT; Schema: public; Owner: julianranieri
--

ALTER TABLE ONLY public."Clock"
    ADD CONSTRAINT "Clock_pkey" PRIMARY KEY (id);


--
-- Name: ProjectModule ProjectModule_pkey; Type: CONSTRAINT; Schema: public; Owner: julianranieri
--

ALTER TABLE ONLY public."ProjectModule"
    ADD CONSTRAINT "ProjectModule_pkey" PRIMARY KEY (id);


--
-- Name: Project Project_pkey; Type: CONSTRAINT; Schema: public; Owner: julianranieri
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_pkey" PRIMARY KEY (id);


--
-- Name: User User_email_key; Type: CONSTRAINT; Schema: public; Owner: julianranieri
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_email_key" UNIQUE (email);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: julianranieri
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

