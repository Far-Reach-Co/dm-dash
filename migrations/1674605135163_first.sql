--
-- PostgreSQL database dump
--

-- Dumped from database version 14.5 (Ubuntu 14.5-1ubuntu1)
-- Dumped by pg_dump version 14.5 (Ubuntu 14.5-1ubuntu1)

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
    location_id integer,
    image_ref character varying
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
    project_id integer NOT NULL,
    current_count integer NOT NULL,
    title character varying NOT NULL,
    user_id integer NOT NULL
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
    type character varying,
    image_ref character varying
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
    type character varying,
    image_ref character varying
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
    item_id integer,
    user_id integer NOT NULL
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
-- Name: ProjectInvite; Type: TABLE; Schema: public; Owner: julianranieri
--

CREATE TABLE public."ProjectInvite" (
    id integer NOT NULL,
    uuid character varying NOT NULL,
    project_id integer NOT NULL
);


ALTER TABLE public."ProjectInvite" OWNER TO julianranieri;

--
-- Name: ProjectUser; Type: TABLE; Schema: public; Owner: julianranieri
--

CREATE TABLE public."ProjectUser" (
    id integer NOT NULL,
    project_id integer NOT NULL,
    user_id integer NOT NULL,
    is_editor boolean DEFAULT false NOT NULL,
    date_joined timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."ProjectUser" OWNER TO julianranieri;

--
-- Name: ProjectUser_id_seq; Type: SEQUENCE; Schema: public; Owner: julianranieri
--

CREATE SEQUENCE public."ProjectUser_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."ProjectUser_id_seq" OWNER TO julianranieri;

--
-- Name: ProjectUser_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: julianranieri
--

ALTER SEQUENCE public."ProjectUser_id_seq" OWNED BY public."ProjectUser".id;


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
    password character varying NOT NULL,
    name character varying,
    phone character varying
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
-- Name: untitled_table_218_id_seq; Type: SEQUENCE; Schema: public; Owner: julianranieri
--

CREATE SEQUENCE public.untitled_table_218_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.untitled_table_218_id_seq OWNER TO julianranieri;

--
-- Name: untitled_table_218_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: julianranieri
--

ALTER SEQUENCE public.untitled_table_218_id_seq OWNED BY public."ProjectInvite".id;


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
-- Name: ProjectInvite id; Type: DEFAULT; Schema: public; Owner: julianranieri
--

ALTER TABLE ONLY public."ProjectInvite" ALTER COLUMN id SET DEFAULT nextval('public.untitled_table_218_id_seq'::regclass);


--
-- Name: ProjectUser id; Type: DEFAULT; Schema: public; Owner: julianranieri
--

ALTER TABLE ONLY public."ProjectUser" ALTER COLUMN id SET DEFAULT nextval('public."ProjectUser_id_seq"'::regclass);


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
-- Name: ProjectUser ProjectUser_pkey; Type: CONSTRAINT; Schema: public; Owner: julianranieri
--

ALTER TABLE ONLY public."ProjectUser"
    ADD CONSTRAINT "ProjectUser_pkey" PRIMARY KEY (id);


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
-- Name: ProjectInvite untitled_table_218_pkey; Type: CONSTRAINT; Schema: public; Owner: julianranieri
--

ALTER TABLE ONLY public."ProjectInvite"
    ADD CONSTRAINT untitled_table_218_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--