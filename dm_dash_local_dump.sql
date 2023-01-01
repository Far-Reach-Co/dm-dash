--
-- PostgreSQL database dump
--

-- Dumped from database version 14.5 (Homebrew)
-- Dumped by pg_dump version 14.5 (Homebrew)

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
-- Name: Calendar; Type: TABLE; Schema: public; Owner: julianranieri
--

CREATE TABLE public."Calendar" (
    id integer NOT NULL,
    project_id integer NOT NULL,
    title character varying NOT NULL,
    year integer NOT NULL,
    current_month_id integer,
    current_day integer DEFAULT 1 NOT NULL
);


ALTER TABLE public."Calendar" OWNER TO julianranieri;

--
-- Name: Calendar_id_seq; Type: SEQUENCE; Schema: public; Owner: julianranieri
--

CREATE SEQUENCE public."Calendar_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Calendar_id_seq" OWNER TO julianranieri;

--
-- Name: Calendar_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: julianranieri
--

ALTER SEQUENCE public."Calendar_id_seq" OWNED BY public."Calendar".id;


--
-- Name: Character; Type: TABLE; Schema: public; Owner: julianranieri
--

CREATE TABLE public."Character" (
    id integer NOT NULL,
    project_id integer NOT NULL,
    title character varying NOT NULL,
    description character varying NOT NULL,
    type character varying,
    location_id integer
);


ALTER TABLE public."Character" OWNER TO julianranieri;

--
-- Name: Character_id_seq; Type: SEQUENCE; Schema: public; Owner: julianranieri
--

CREATE SEQUENCE public."Character_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Character_id_seq" OWNER TO julianranieri;

--
-- Name: Character_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: julianranieri
--

ALTER SEQUENCE public."Character_id_seq" OWNED BY public."Character".id;


--
-- Name: Clock; Type: TABLE; Schema: public; Owner: julianranieri
--

CREATE TABLE public."Clock" (
    id integer NOT NULL,
    title character varying NOT NULL,
    current_time_in_milliseconds integer NOT NULL,
    project_id integer NOT NULL
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
-- Name: Counter; Type: TABLE; Schema: public; Owner: julianranieri
--

CREATE TABLE public."Counter" (
    id integer NOT NULL,
    project_id real NOT NULL,
    current_count integer NOT NULL,
    title character varying NOT NULL
);


ALTER TABLE public."Counter" OWNER TO julianranieri;

--
-- Name: Counter_id_seq; Type: SEQUENCE; Schema: public; Owner: julianranieri
--

CREATE SEQUENCE public."Counter_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Counter_id_seq" OWNER TO julianranieri;

--
-- Name: Counter_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: julianranieri
--

ALTER SEQUENCE public."Counter_id_seq" OWNED BY public."Counter".id;


--
-- Name: Day; Type: TABLE; Schema: public; Owner: julianranieri
--

CREATE TABLE public."Day" (
    id integer NOT NULL,
    title character varying NOT NULL,
    calendar_id integer NOT NULL,
    index integer NOT NULL
);


ALTER TABLE public."Day" OWNER TO julianranieri;

--
-- Name: Day_id_seq; Type: SEQUENCE; Schema: public; Owner: julianranieri
--

CREATE SEQUENCE public."Day_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Day_id_seq" OWNER TO julianranieri;

--
-- Name: Day_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: julianranieri
--

ALTER SEQUENCE public."Day_id_seq" OWNED BY public."Day".id;


--
-- Name: Event; Type: TABLE; Schema: public; Owner: julianranieri
--

CREATE TABLE public."Event" (
    id integer NOT NULL,
    title character varying NOT NULL,
    description character varying NOT NULL,
    location_id integer,
    date_created date DEFAULT now() NOT NULL,
    calendar_date character varying,
    calendar_id integer,
    clock_time_in_milliseconds integer,
    clock_id integer,
    project_id integer NOT NULL
);


ALTER TABLE public."Event" OWNER TO julianranieri;

--
-- Name: Event_id_seq; Type: SEQUENCE; Schema: public; Owner: julianranieri
--

CREATE SEQUENCE public."Event_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Event_id_seq" OWNER TO julianranieri;

--
-- Name: Event_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: julianranieri
--

ALTER SEQUENCE public."Event_id_seq" OWNED BY public."Event".id;


--
-- Name: Item; Type: TABLE; Schema: public; Owner: julianranieri
--

CREATE TABLE public."Item" (
    id integer NOT NULL,
    title character varying NOT NULL,
    description character varying NOT NULL,
    project_id integer NOT NULL,
    location_id integer,
    character_id integer,
    type character varying
);


ALTER TABLE public."Item" OWNER TO julianranieri;

--
-- Name: Item_id_seq; Type: SEQUENCE; Schema: public; Owner: julianranieri
--

CREATE SEQUENCE public."Item_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Item_id_seq" OWNER TO julianranieri;

--
-- Name: Item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: julianranieri
--

ALTER SEQUENCE public."Item_id_seq" OWNED BY public."Item".id;


--
-- Name: Location; Type: TABLE; Schema: public; Owner: julianranieri
--

CREATE TABLE public."Location" (
    id integer NOT NULL,
    title character varying NOT NULL,
    is_sub boolean NOT NULL,
    parent_location_id integer,
    project_id integer NOT NULL,
    description character varying,
    type character varying
);


ALTER TABLE public."Location" OWNER TO julianranieri;

--
-- Name: Location_id_seq; Type: SEQUENCE; Schema: public; Owner: julianranieri
--

CREATE SEQUENCE public."Location_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Location_id_seq" OWNER TO julianranieri;

--
-- Name: Location_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: julianranieri
--

ALTER SEQUENCE public."Location_id_seq" OWNED BY public."Location".id;


--
-- Name: Month; Type: TABLE; Schema: public; Owner: julianranieri
--

CREATE TABLE public."Month" (
    id integer NOT NULL,
    calendar_id integer NOT NULL,
    index integer NOT NULL,
    title character varying NOT NULL,
    number_of_days integer NOT NULL
);


ALTER TABLE public."Month" OWNER TO julianranieri;

--
-- Name: Month_id_seq; Type: SEQUENCE; Schema: public; Owner: julianranieri
--

CREATE SEQUENCE public."Month_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Month_id_seq" OWNER TO julianranieri;

--
-- Name: Month_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: julianranieri
--

ALTER SEQUENCE public."Month_id_seq" OWNED BY public."Month".id;


--
-- Name: Note; Type: TABLE; Schema: public; Owner: julianranieri
--

CREATE TABLE public."Note" (
    id integer NOT NULL,
    title character varying NOT NULL,
    description character varying NOT NULL,
    location_id integer,
    date_created timestamp with time zone DEFAULT now() NOT NULL,
    project_id integer NOT NULL,
    character_id integer,
    item_id integer
);


ALTER TABLE public."Note" OWNER TO julianranieri;

--
-- Name: Note_id_seq; Type: SEQUENCE; Schema: public; Owner: julianranieri
--

CREATE SEQUENCE public."Note_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Note_id_seq" OWNER TO julianranieri;

--
-- Name: Note_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: julianranieri
--

ALTER SEQUENCE public."Note_id_seq" OWNED BY public."Note".id;


--
-- Name: Project; Type: TABLE; Schema: public; Owner: julianranieri
--

CREATE TABLE public."Project" (
    id integer NOT NULL,
    title character varying(100) NOT NULL,
    user_id integer NOT NULL,
    date_created timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."Project" OWNER TO julianranieri;

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
-- Name: TurnOrder; Type: TABLE; Schema: public; Owner: julianranieri
--

CREATE TABLE public."TurnOrder" (
    id integer NOT NULL,
    title character varying NOT NULL,
    project_id integer NOT NULL,
    current_item_id real NOT NULL
);


ALTER TABLE public."TurnOrder" OWNER TO julianranieri;

--
-- Name: TurnOrderItem; Type: TABLE; Schema: public; Owner: julianranieri
--

CREATE TABLE public."TurnOrderItem" (
    id integer NOT NULL,
    turn_order_id integer NOT NULL,
    title character varying,
    index integer NOT NULL,
    player_id integer,
    enemy_id integer
);


ALTER TABLE public."TurnOrderItem" OWNER TO julianranieri;

--
-- Name: TurnOrderItem_id_seq; Type: SEQUENCE; Schema: public; Owner: julianranieri
--

CREATE SEQUENCE public."TurnOrderItem_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."TurnOrderItem_id_seq" OWNER TO julianranieri;

--
-- Name: TurnOrderItem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: julianranieri
--

ALTER SEQUENCE public."TurnOrderItem_id_seq" OWNED BY public."TurnOrderItem".id;


--
-- Name: TurnOrder_id_seq; Type: SEQUENCE; Schema: public; Owner: julianranieri
--

CREATE SEQUENCE public."TurnOrder_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."TurnOrder_id_seq" OWNER TO julianranieri;

--
-- Name: TurnOrder_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: julianranieri
--

ALTER SEQUENCE public."TurnOrder_id_seq" OWNED BY public."TurnOrder".id;


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
-- Name: Calendar id; Type: DEFAULT; Schema: public; Owner: julianranieri
--

ALTER TABLE ONLY public."Calendar" ALTER COLUMN id SET DEFAULT nextval('public."Calendar_id_seq"'::regclass);


--
-- Name: Character id; Type: DEFAULT; Schema: public; Owner: julianranieri
--

ALTER TABLE ONLY public."Character" ALTER COLUMN id SET DEFAULT nextval('public."Character_id_seq"'::regclass);


--
-- Name: Clock id; Type: DEFAULT; Schema: public; Owner: julianranieri
--

ALTER TABLE ONLY public."Clock" ALTER COLUMN id SET DEFAULT nextval('public."Clock_id_seq"'::regclass);


--
-- Name: Counter id; Type: DEFAULT; Schema: public; Owner: julianranieri
--

ALTER TABLE ONLY public."Counter" ALTER COLUMN id SET DEFAULT nextval('public."Counter_id_seq"'::regclass);


--
-- Name: Day id; Type: DEFAULT; Schema: public; Owner: julianranieri
--

ALTER TABLE ONLY public."Day" ALTER COLUMN id SET DEFAULT nextval('public."Day_id_seq"'::regclass);


--
-- Name: Event id; Type: DEFAULT; Schema: public; Owner: julianranieri
--

ALTER TABLE ONLY public."Event" ALTER COLUMN id SET DEFAULT nextval('public."Event_id_seq"'::regclass);


--
-- Name: Item id; Type: DEFAULT; Schema: public; Owner: julianranieri
--

ALTER TABLE ONLY public."Item" ALTER COLUMN id SET DEFAULT nextval('public."Item_id_seq"'::regclass);


--
-- Name: Location id; Type: DEFAULT; Schema: public; Owner: julianranieri
--

ALTER TABLE ONLY public."Location" ALTER COLUMN id SET DEFAULT nextval('public."Location_id_seq"'::regclass);


--
-- Name: Month id; Type: DEFAULT; Schema: public; Owner: julianranieri
--

ALTER TABLE ONLY public."Month" ALTER COLUMN id SET DEFAULT nextval('public."Month_id_seq"'::regclass);


--
-- Name: Note id; Type: DEFAULT; Schema: public; Owner: julianranieri
--

ALTER TABLE ONLY public."Note" ALTER COLUMN id SET DEFAULT nextval('public."Note_id_seq"'::regclass);


--
-- Name: Project id; Type: DEFAULT; Schema: public; Owner: julianranieri
--

ALTER TABLE ONLY public."Project" ALTER COLUMN id SET DEFAULT nextval('public."Project_id_seq"'::regclass);


--
-- Name: TurnOrder id; Type: DEFAULT; Schema: public; Owner: julianranieri
--

ALTER TABLE ONLY public."TurnOrder" ALTER COLUMN id SET DEFAULT nextval('public."TurnOrder_id_seq"'::regclass);


--
-- Name: TurnOrderItem id; Type: DEFAULT; Schema: public; Owner: julianranieri
--

ALTER TABLE ONLY public."TurnOrderItem" ALTER COLUMN id SET DEFAULT nextval('public."TurnOrderItem_id_seq"'::regclass);


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: julianranieri
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Data for Name: Calendar; Type: TABLE DATA; Schema: public; Owner: julianranieri
--

COPY public."Calendar" (id, project_id, title, year, current_month_id, current_day) FROM stdin;
28	29	toms calendar  v2	5000	80	31
21	29	Testing Calendar	3000	65	15
33	29	test creator	3	104	1
\.


--
-- Data for Name: Character; Type: TABLE DATA; Schema: public; Owner: julianranieri
--

COPY public."Character" (id, project_id, title, description, type, location_id) FROM stdin;
2	29	BitchAss Dude	fuck y9oua fjoiji fie feu8fe8 90au avnfia 8eu 8uf a\nafeiwaufe8 auf8e aufdjiac daojcd fe\nfeai9fu8eia	Entity	4
1	29	Asshole Guy	he sucks\nfijeowjafeo qjfieo qjife afeiw 4quf89quf a\nfe9qufe9 uafewa\nfejao q\n49quf94 uq9f0ueafudafa	NPC	4
\.


--
-- Data for Name: Clock; Type: TABLE DATA; Schema: public; Owner: julianranieri
--

COPY public."Clock" (id, title, current_time_in_milliseconds, project_id) FROM stdin;
39	Main Time	29547875	29
44	Tom's Clock	54088	29
\.


--
-- Data for Name: Counter; Type: TABLE DATA; Schema: public; Owner: julianranieri
--

COPY public."Counter" (id, project_id, current_count, title) FROM stdin;
2	29	4	Savages
1	29	12	Plates
\.


--
-- Data for Name: Day; Type: TABLE DATA; Schema: public; Owner: julianranieri
--

COPY public."Day" (id, title, calendar_id, index) FROM stdin;
68	eac	33	1
69	nee	33	2
70	saw	33	3
71	gee	33	4
43	primus	22	1
44	fafa	25	1
45	rewrewa	25	2
46	wrewerew	25	3
47	rewrew	25	4
48	Mon	28	1
49	tues	28	2
50	wed	28	3
51	thurs	28	4
52	fri	28	5
53	sat	28	6
54	sun	28	7
55	syeah	29	1
56	eowfiewa	29	2
57	oweea	29	3
58	fjao	30	1
59	ew	30	2
61	a9fafa	30	3
60	a9fua	30	4
62	32i32	31	1
63	232r32	31	2
64	32i32	31	3
65	232r32	31	4
66	r32r32r	31	5
67	fafa	32	1
33	Und	21	1
34	Senv	21	2
35	Tirm	21	3
36	Fou	21	4
37	Cice	21	5
38	Seni	21	6
39	Otat	21	7
\.


--
-- Data for Name: Event; Type: TABLE DATA; Schema: public; Owner: julianranieri
--

COPY public."Event" (id, title, description, location_id, date_created, calendar_date, calendar_id, clock_time_in_milliseconds, clock_id, project_id) FROM stdin;
\.


--
-- Data for Name: Item; Type: TABLE DATA; Schema: public; Owner: julianranieri
--

COPY public."Item" (id, title, description, project_id, location_id, character_id, type) FROM stdin;
1	Sword of Bullshit	fuck you okay afkdaiojfeiow a\nefjaiofej aopfj e\neajifoejaoea	29	4	1	Weapon
2	Barrel of Garbage	disgusting fucking garbage 	29	16	2	Structure
\.


--
-- Data for Name: Location; Type: TABLE DATA; Schema: public; Owner: julianranieri
--

COPY public."Location" (id, title, is_sub, parent_location_id, project_id, description, type) FROM stdin;
16	Butchery	f	\N	29	fjioajfea fjeoia f aoifje oa feioa fjeioa 	Shop
15	Evangelion	t	3	29	afjda ajiof e 03u9 r3u fa ndkzn er8 03 09 DAU A 392 RAJI FO aoieua r3 09a eoa jfdao    dklznmv e9wr 9a 09-efia9 -daj	City
5	Cazmione	t	2	29	e8 vhuahv eiureia uhdah. jiaofjoije ioahjreiojai jdiojda oiejoa fjialjdi iojioe anvnjknxv fjeaioi njanuihu vnjianf ioajeoia najeiwhi dnjaknj ofueoiau njfna ja fioeja nvanioj\najfoda\njfaojoa;fj	Town
3	Shelminor	f	\N	29	and athere wahfoedhjaoi foduaou reiaojoe dadnaf the eajojfiod and the roea p ojdasojo habihob oh itoafjoje aojifdoa other eojfoaj asohsame	Village
2	Gradelheim	t	18	29	jafoj aojfdoaj rewour euwourewodvannvfkl adjsancd ndjaknfd fhiaoure thoeh oahjoa eih ahidoh ehheo aodho ao a eior ahdoahoha ejaorje ajojdaj fahehrnxk 	Region
18	Natura Celestar	f	\N	29	ajfioea ojfieoa eo eo ae f	Planet
19	Blacksmith	t	4	29	jfiao eowi e\neiowjeowjofejw ofejwo efwfjeo\nfjeowjfeiow woejfiew o	Shop
4	Basminith	t	2	29	ajfd faojfia oerupoandoa 248u efaoi 3r82u38 daknvcckzn fehaiohfa 38ry9up daij doaj98ur39. diah ru3892 ur839 AI JIAO FUE9AU 8UA9U R9afafdafdafdsafdafdafda\n3334	City
\.


--
-- Data for Name: Month; Type: TABLE DATA; Schema: public; Owner: julianranieri
--

COPY public."Month" (id, calendar_id, index, title, number_of_days) FROM stdin;
73	24	1	fir	30
74	24	2	secon	30
75	24	3	firgt	30
76	25	1	fadf	3
77	25	2	eafea	2
78	25	3	r3r3	2
79	25	4	r4t	2
80	28	1	Jan	31
81	28	2	Feb	29
82	28	3	mar	31
83	28	4	apr	30
84	28	5	may	30
85	28	6	june	30
86	28	7	jul	30
87	28	8	aug	70
88	28	9	sep	6
89	28	10	oct	30
90	28	11	nov	30
91	28	12	dec	28
92	29	1	afa	20
93	29	2	okay	30
94	29	3	fsure	4
95	30	1	first	39
96	30	2	sure um	39
97	30	3	yeah ok	30
98	30	4	oknn	20
99	31	1	fjeiwo	3
72	22	1	cat	7
100	31	2	fjidaof	3
101	31	3	iw3o23	3
102	31	4	3i2323	3
103	32	1	ewfea	3
63	21	1	Mout	30
69	21	7	Sasmo	30
64	21	2	Suiet	30
65	21	3	Foute	30
66	21	4	Clamen	30
67	21	5	Shonpa	30
70	21	8	Chelgo	30
71	21	9	Demce	30
68	21	6	Fratei	30
104	33	1	one	2
105	33	2	due	4
106	33	3	okay	4
107	33	4	sure	333
\.


--
-- Data for Name: Note; Type: TABLE DATA; Schema: public; Owner: julianranieri
--

COPY public."Note" (id, title, description, location_id, date_created, project_id, character_id, item_id) FROM stdin;
30	unrelated note	fjiodajfeoaw jfeioawjfiej waoij\nfejiowajfeoaij \nfeoiajfeioajfea	\N	2022-12-29 11:05:14.627403-08	29	\N	\N
26	Magic trash	eiwao yfep its ifs fdackcd ajfewag a\nafioejao feja \ndaoi0eu afeuaw09fueafea	2	2022-12-27 12:50:15.35198-08	29	\N	\N
17	evang1	fjdaiofjdao \naaiofjodajfiodjaiofdjaojfieoawur3ea \n- fjioajei \n-fda \njfea0ufeua0f eafe\n- aijfejia fea afjeoidjaoifjewafe	15	2022-12-25 06:42:06.41809-08	29	\N	\N
16	Testing Location1	jaofjei fepajeo ioeja oj ajfo eioa iea dcakmcvdla eirjoa dka cdiear oiej fadklfmdada	4	2022-12-25 06:34:23.430174-08	29	\N	\N
15	tester 4 call of the wild dude	ajfidoajf afjoaj faiojf. weij eamncv ifjea. 39aru390 v noa 0r9. 4u fa aiojo 43hajf v0 anvkd -r934a andjsa 08w r940\n	2	2022-12-25 06:03:03.440175-08	29	\N	\N
14	Gh note1	afjdioajfiopda fodaj'fdjioafda\nfdahjofdajfda\nhaiofjidafadfdafdaa	2	2022-12-24 04:59:05.301761-08	29	\N	\N
2	Second Note	fejadofj fjiaod af joa effjiao f fjoa jeanfbeai afdafdafdafa 4444444eawru8 vhuav0 3 03 feac cd a [[fu8t49a. 48uf9a fa ndai eu 38 hfaida ha ea\n7777fkk\n\ntesting blah blah\nokay sure there is abreak	2	2022-12-22 14:10:33.018843-08	29	\N	\N
1	Test Note	fjidoa faofjio enaj roejaio jfdoa vodjaojrei aprejioa jfo jodpajifoejao fejoajfioe ajfoea fjeioa jfeoajfie aj feoap fja	\N	2022-12-22 00:00:00-08	29	\N	\N
19	newtest	afjiodjafjfdajiofjdaiofeaw	4	2022-12-26 09:02:21.649066-08	29	\N	\N
28	SuperSoaker	eiwajfieja\nfeiaofjeaofje\naeiajoejaioeja\nfafda	4	2022-12-28 07:27:13.613121-08	29	\N	\N
34	The fuck	fejioajfeiaf	\N	2022-12-30 10:03:39.959523-08	29	\N	1
33	It sucks	yeah it really does	\N	2022-12-30 09:56:26.054127-08	29	\N	1
36	Sure yep	fjdaiofejwa	\N	2022-12-30 10:24:31.56678-08	29	\N	\N
37	Screw that	fjaioejwafe\nafeioajfewa	\N	2022-12-30 10:25:33.042062-08	29	\N	1
20	moon-touched Sword	Source: Xanathar's Guide to Everything\n\nWeapon (any sword), common\n\nIn darkness, the unsheathed blade of this sword sheds moonlight, creating bright light in a 15-foot radius and dim light for an additional 15 feet.\n\n	5	2022-12-26 09:02:41.172134-08	29	\N	\N
24	Jack Hammer	fjiaofj efjio iwear u4 euw9 avav a dca\near93u r 93Ur903u rdnja vida fa\n- fe9wa \n-ea9 ue\na-=w f=ewa feialva	4	2022-12-27 12:48:17.216887-08	29	\N	\N
22	Tom's Note	Tom Made a not in Basminith	4	2022-12-26 12:12:06.598932-08	29	\N	\N
27	BigSucker	jdaiofjea ojefiaw jfiea \nfejiwoajfei a\nfekaoijfeioa jeoiaj iewa	4	2022-12-28 07:24:02.276463-08	29	\N	\N
38	Fucker	yep a stupid fucker really\nafjeioajfeoajfe\nafjieoajfeoajfeaf\neaf	\N	2022-12-30 15:34:22.376921-08	29	1	\N
29	Sucks	sucks to suck 	\N	2022-12-29 09:39:06.040461-08	29	1	\N
42	blower	fjeoiwajfiea\nfjeioafjeoajf\neajioeaifjea	\N	2022-12-30 15:51:59.87188-08	29	\N	\N
41	cunter	afjjeiaofea\nfeoajfeioaj\neajfioejaofjeaf	\N	2022-12-30 15:51:53.261632-08	29	\N	\N
40	sucker	afjeioajfieoajf\nejaiofeaojfea\nfjeioajfeoaif	\N	2022-12-30 15:51:46.310495-08	29	\N	\N
39	furcker	ajfioeaj feojaofea\nfeiaojfeoajf\najfoeaf	\N	2022-12-30 15:51:38.660364-08	29	\N	\N
\.


--
-- Data for Name: Project; Type: TABLE DATA; Schema: public; Owner: julianranieri
--

COPY public."Project" (id, title, user_id, date_created) FROM stdin;
31	Hello Wyrld	53	2022-12-26 12:47:42.755491-08
33	My Project	49	2022-12-29 13:17:16.43214-08
29	Testing	49	2022-12-22 00:00:00-08
\.


--
-- Data for Name: TurnOrder; Type: TABLE DATA; Schema: public; Owner: julianranieri
--

COPY public."TurnOrder" (id, title, project_id, current_item_id) FROM stdin;
\.


--
-- Data for Name: TurnOrderItem; Type: TABLE DATA; Schema: public; Owner: julianranieri
--

COPY public."TurnOrderItem" (id, turn_order_id, title, index, player_id, enemy_id) FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: julianranieri
--

COPY public."User" (id, email, password) FROM stdin;
48	jules@mail.com	$2b$10$jI5QnoOPrcQrzgMuj7zx0OOp5jA4D8046v8LOz1IXEkQNPMHkuDtG
49	admin	$2b$10$.GoksSZvUXJD2rpc33eJMu.9HnI8ENNkNkiciJyG07qOQM8psrWO2
53	tom.ascough@gmail.com	$2b$10$KPox8kUfopOM/OuiIobErepCbbAZ6zc9Arg.BsItNdWZ4HvByOmAa
\.


--
-- Name: Calendar_id_seq; Type: SEQUENCE SET; Schema: public; Owner: julianranieri
--

SELECT pg_catalog.setval('public."Calendar_id_seq"', 33, true);


--
-- Name: Character_id_seq; Type: SEQUENCE SET; Schema: public; Owner: julianranieri
--

SELECT pg_catalog.setval('public."Character_id_seq"', 3, true);


--
-- Name: Clock_id_seq; Type: SEQUENCE SET; Schema: public; Owner: julianranieri
--

SELECT pg_catalog.setval('public."Clock_id_seq"', 44, true);


--
-- Name: Counter_id_seq; Type: SEQUENCE SET; Schema: public; Owner: julianranieri
--

SELECT pg_catalog.setval('public."Counter_id_seq"', 3, true);


--
-- Name: Day_id_seq; Type: SEQUENCE SET; Schema: public; Owner: julianranieri
--

SELECT pg_catalog.setval('public."Day_id_seq"', 72, true);


--
-- Name: Event_id_seq; Type: SEQUENCE SET; Schema: public; Owner: julianranieri
--

SELECT pg_catalog.setval('public."Event_id_seq"', 1, false);


--
-- Name: Item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: julianranieri
--

SELECT pg_catalog.setval('public."Item_id_seq"', 3, true);


--
-- Name: Location_id_seq; Type: SEQUENCE SET; Schema: public; Owner: julianranieri
--

SELECT pg_catalog.setval('public."Location_id_seq"', 19, true);


--
-- Name: Month_id_seq; Type: SEQUENCE SET; Schema: public; Owner: julianranieri
--

SELECT pg_catalog.setval('public."Month_id_seq"', 108, true);


--
-- Name: Note_id_seq; Type: SEQUENCE SET; Schema: public; Owner: julianranieri
--

SELECT pg_catalog.setval('public."Note_id_seq"', 43, true);


--
-- Name: Project_id_seq; Type: SEQUENCE SET; Schema: public; Owner: julianranieri
--

SELECT pg_catalog.setval('public."Project_id_seq"', 33, true);


--
-- Name: TurnOrderItem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: julianranieri
--

SELECT pg_catalog.setval('public."TurnOrderItem_id_seq"', 1, false);


--
-- Name: TurnOrder_id_seq; Type: SEQUENCE SET; Schema: public; Owner: julianranieri
--

SELECT pg_catalog.setval('public."TurnOrder_id_seq"', 1, false);


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: julianranieri
--

SELECT pg_catalog.setval('public."User_id_seq"', 53, true);


--
-- Name: Calendar Calendar_pkey; Type: CONSTRAINT; Schema: public; Owner: julianranieri
--

ALTER TABLE ONLY public."Calendar"
    ADD CONSTRAINT "Calendar_pkey" PRIMARY KEY (id);


--
-- Name: Character Character_pkey; Type: CONSTRAINT; Schema: public; Owner: julianranieri
--

ALTER TABLE ONLY public."Character"
    ADD CONSTRAINT "Character_pkey" PRIMARY KEY (id);


--
-- Name: Clock Clock_pkey; Type: CONSTRAINT; Schema: public; Owner: julianranieri
--

ALTER TABLE ONLY public."Clock"
    ADD CONSTRAINT "Clock_pkey" PRIMARY KEY (id);


--
-- Name: Counter Counter_pkey; Type: CONSTRAINT; Schema: public; Owner: julianranieri
--

ALTER TABLE ONLY public."Counter"
    ADD CONSTRAINT "Counter_pkey" PRIMARY KEY (id);


--
-- Name: Day Day_pkey; Type: CONSTRAINT; Schema: public; Owner: julianranieri
--

ALTER TABLE ONLY public."Day"
    ADD CONSTRAINT "Day_pkey" PRIMARY KEY (id);


--
-- Name: Event Event_pkey; Type: CONSTRAINT; Schema: public; Owner: julianranieri
--

ALTER TABLE ONLY public."Event"
    ADD CONSTRAINT "Event_pkey" PRIMARY KEY (id);


--
-- Name: Item Item_pkey; Type: CONSTRAINT; Schema: public; Owner: julianranieri
--

ALTER TABLE ONLY public."Item"
    ADD CONSTRAINT "Item_pkey" PRIMARY KEY (id);


--
-- Name: Location Location_pkey; Type: CONSTRAINT; Schema: public; Owner: julianranieri
--

ALTER TABLE ONLY public."Location"
    ADD CONSTRAINT "Location_pkey" PRIMARY KEY (id);


--
-- Name: Month Month_pkey; Type: CONSTRAINT; Schema: public; Owner: julianranieri
--

ALTER TABLE ONLY public."Month"
    ADD CONSTRAINT "Month_pkey" PRIMARY KEY (id);


--
-- Name: Note Note_pkey; Type: CONSTRAINT; Schema: public; Owner: julianranieri
--

ALTER TABLE ONLY public."Note"
    ADD CONSTRAINT "Note_pkey" PRIMARY KEY (id);


--
-- Name: Project Project_pkey; Type: CONSTRAINT; Schema: public; Owner: julianranieri
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_pkey" PRIMARY KEY (id);


--
-- Name: TurnOrderItem TurnOrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: julianranieri
--

ALTER TABLE ONLY public."TurnOrderItem"
    ADD CONSTRAINT "TurnOrderItem_pkey" PRIMARY KEY (id);


--
-- Name: TurnOrder TurnOrder_pkey; Type: CONSTRAINT; Schema: public; Owner: julianranieri
--

ALTER TABLE ONLY public."TurnOrder"
    ADD CONSTRAINT "TurnOrder_pkey" PRIMARY KEY (id);


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

