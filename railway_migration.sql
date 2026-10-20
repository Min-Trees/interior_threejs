--
-- PostgreSQL database dump
--

\restrict R8YhAlrJGg3HbUfCuRid8yN2hD6okvwtVDebhS1a6uOMu9Huw2UgGQ97IIh5DZn

-- Dumped from database version 17.10
-- Dumped by pg_dump version 17.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.showroom_appointments DROP CONSTRAINT IF EXISTS fksky6qlr5ag072c22qj511no0i;
ALTER TABLE IF EXISTS ONLY public.cart_items DROP CONSTRAINT IF EXISTS fkpcttvuq4mxppo8sxggjtn5i2c;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS fkp56c1712k691lhsyewcssf40f;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS fkog2rp4qthbtt2lfyhfo32lsw9;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS fkocimc7dtr037rh4ls4l95nlfi;
ALTER TABLE IF EXISTS ONLY public.payment_transactions DROP CONSTRAINT IF EXISTS fknsous9qyrjv5ss8que6o6617;
ALTER TABLE IF EXISTS ONLY public.wishlists DROP CONSTRAINT IF EXISTS fkl7ao98u2bm8nijc1rv4jobcrx;
ALTER TABLE IF EXISTS ONLY public.user_preferences DROP CONSTRAINT IF EXISTS fkepakpib0qnm82vmaiismkqf88;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS fkbioxgbv59vetrxe0ejfubep1w;
ALTER TABLE IF EXISTS ONLY public.carts DROP CONSTRAINT IF EXISTS fkb5o626f86h46m4s7ms6ginnop;
ALTER TABLE IF EXISTS ONLY public.chat_sessions DROP CONSTRAINT IF EXISTS fk82ky97glaomlmhjqae1d0esmy;
ALTER TABLE IF EXISTS ONLY public.product_reviews DROP CONSTRAINT IF EXISTS fk58i39bhws2hss3tbcvdmrm60f;
ALTER TABLE IF EXISTS ONLY public.chat_messages DROP CONSTRAINT IF EXISTS fk3cpkdtwdxndrjhrx3gt9q5ux9;
ALTER TABLE IF EXISTS ONLY public.product_reviews DROP CONSTRAINT IF EXISTS fk35kxxqe2g9r4mww80w9e3tnw9;
ALTER TABLE IF EXISTS ONLY public.wishlists DROP CONSTRAINT IF EXISTS fk330pyw2el06fn5g28ypyljt16;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS fk32ql8ubntj5uh44ph9659tiih;
ALTER TABLE IF EXISTS ONLY public.cart_items DROP CONSTRAINT IF EXISTS fk1re40cjegsfvw58xrkdp6bac6;
ALTER TABLE IF EXISTS ONLY public.wishlists DROP CONSTRAINT IF EXISTS wishlists_pkey;
ALTER TABLE IF EXISTS ONLY public.vouchers DROP CONSTRAINT IF EXISTS vouchers_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.user_preferences DROP CONSTRAINT IF EXISTS user_preferences_pkey;
ALTER TABLE IF EXISTS ONLY public.categories DROP CONSTRAINT IF EXISTS ukoul14ho7bctbefv8jywp5v3i2;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS ukostq1ec3toafnjok09y9l7dox;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS ukofx66keruapi6vyqpv6f2or37;
ALTER TABLE IF EXISTS ONLY public.wishlists DROP CONSTRAINT IF EXISTS ukht6e6158srxsvjciahp1kjywf;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS ukdhk2umg8ijjkg4njg6891trit;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS uk6dotkott2kjsp8vw4d0m25fb7;
ALTER TABLE IF EXISTS ONLY public.carts DROP CONSTRAINT IF EXISTS uk64t7ox312pqal3p7fg9o503c2;
ALTER TABLE IF EXISTS ONLY public.vouchers DROP CONSTRAINT IF EXISTS uk30ftp2biebbvpik8e49wlmady;
ALTER TABLE IF EXISTS ONLY public.showroom_appointments DROP CONSTRAINT IF EXISTS showroom_appointments_pkey;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS roles_pkey;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_pkey;
ALTER TABLE IF EXISTS ONLY public.product_reviews DROP CONSTRAINT IF EXISTS product_reviews_pkey;
ALTER TABLE IF EXISTS ONLY public.payment_transactions DROP CONSTRAINT IF EXISTS payment_transactions_pkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_pkey;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_pkey;
ALTER TABLE IF EXISTS ONLY public.chat_sessions DROP CONSTRAINT IF EXISTS chat_sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.chat_messages DROP CONSTRAINT IF EXISTS chat_messages_pkey;
ALTER TABLE IF EXISTS ONLY public.categories DROP CONSTRAINT IF EXISTS categories_pkey;
ALTER TABLE IF EXISTS ONLY public.carts DROP CONSTRAINT IF EXISTS carts_pkey;
ALTER TABLE IF EXISTS ONLY public.cart_items DROP CONSTRAINT IF EXISTS cart_items_pkey;
DROP TABLE IF EXISTS public.wishlists;
DROP TABLE IF EXISTS public.vouchers;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.user_preferences;
DROP TABLE IF EXISTS public.showroom_appointments;
DROP TABLE IF EXISTS public.roles;
DROP TABLE IF EXISTS public.products;
DROP TABLE IF EXISTS public.product_reviews;
DROP TABLE IF EXISTS public.payment_transactions;
DROP TABLE IF EXISTS public.orders;
DROP TABLE IF EXISTS public.order_items;
DROP TABLE IF EXISTS public.chat_sessions;
DROP TABLE IF EXISTS public.chat_messages;
DROP TABLE IF EXISTS public.categories;
DROP TABLE IF EXISTS public.carts;
DROP TABLE IF EXISTS public.cart_items;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cart_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cart_items (
    id bigint NOT NULL,
    price numeric(12,2) NOT NULL,
    quantity integer NOT NULL,
    cart_id bigint NOT NULL,
    product_id bigint NOT NULL
);


--
-- Name: cart_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.cart_items ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.cart_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: carts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.carts (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone,
    updated_at timestamp(6) without time zone,
    user_id bigint NOT NULL
);


--
-- Name: carts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.carts ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.carts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone,
    description text,
    display_order integer,
    image_url character varying(500),
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    updated_at timestamp(6) without time zone
);


--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.categories ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_messages (
    id bigint NOT NULL,
    content text NOT NULL,
    created_at timestamp(6) without time zone,
    product_metadata text,
    sender character varying(20) NOT NULL,
    session_id character varying(64) NOT NULL,
    CONSTRAINT chat_messages_sender_check CHECK (((sender)::text = ANY ((ARRAY['USER'::character varying, 'ASSISTANT'::character varying])::text[])))
);


--
-- Name: chat_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.chat_messages ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.chat_messages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: chat_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_sessions (
    id character varying(64) NOT NULL,
    created_at timestamp(6) without time zone,
    session_token character varying(100),
    title character varying(255),
    updated_at timestamp(6) without time zone,
    user_id bigint
);


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id bigint NOT NULL,
    product_name character varying(255) NOT NULL,
    product_thumbnail character varying(500),
    quantity integer NOT NULL,
    total_price numeric(12,2) NOT NULL,
    unit_price numeric(12,2) NOT NULL,
    order_id bigint NOT NULL,
    product_id bigint
);


--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.order_items ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.order_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone,
    note text,
    order_code character varying(64) NOT NULL,
    payment_method character varying(30) NOT NULL,
    payment_status character varying(30) NOT NULL,
    recipient_name character varying(100) NOT NULL,
    recipient_phone character varying(20) NOT NULL,
    shipping_address character varying(255) NOT NULL,
    shipping_fee numeric(12,2),
    status character varying(30) NOT NULL,
    total_amount numeric(12,2) NOT NULL,
    updated_at timestamp(6) without time zone,
    user_id bigint,
    discount_amount numeric(12,2),
    voucher_code character varying(32),
    CONSTRAINT orders_payment_method_check CHECK (((payment_method)::text = ANY ((ARRAY['COD'::character varying, 'BANKING'::character varying])::text[]))),
    CONSTRAINT orders_payment_status_check CHECK (((payment_status)::text = ANY ((ARRAY['UNPAID'::character varying, 'PAID'::character varying])::text[]))),
    CONSTRAINT orders_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'CONFIRMED'::character varying, 'SHIPPING'::character varying, 'COMPLETED'::character varying, 'CANCELLED'::character varying])::text[])))
);


--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.orders ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.orders_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: payment_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_transactions (
    id bigint NOT NULL,
    amount numeric(12,2) NOT NULL,
    bank_code character varying(30),
    card_type character varying(30),
    created_at timestamp(6) without time zone,
    order_code character varying(64) NOT NULL,
    order_info text,
    pay_date character varying(30),
    payment_method character varying(30),
    response_code character varying(20),
    status character varying(30) NOT NULL,
    transaction_no character varying(64),
    order_id bigint
);


--
-- Name: payment_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.payment_transactions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.payment_transactions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: product_reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_reviews (
    id bigint NOT NULL,
    comment text NOT NULL,
    created_at timestamp(6) without time zone,
    moderation_reason text,
    rating integer NOT NULL,
    status character varying(30) NOT NULL,
    product_id bigint NOT NULL,
    user_id bigint NOT NULL,
    CONSTRAINT product_reviews_status_check CHECK (((status)::text = ANY ((ARRAY['APPROVED'::character varying, 'PENDING_REVIEW'::character varying, 'REJECTED'::character varying])::text[])))
);


--
-- Name: product_reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.product_reviews ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.product_reviews_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id bigint NOT NULL,
    color character varying(50),
    created_at timestamp(6) without time zone,
    description text,
    dimensions character varying(100),
    discount_price numeric(12,2),
    embedding text,
    images text,
    is_active boolean,
    is_featured boolean,
    material character varying(150),
    name character varying(255) NOT NULL,
    price numeric(12,2) NOT NULL,
    slug character varying(255) NOT NULL,
    stock_quantity integer NOT NULL,
    thumbnail character varying(500),
    updated_at timestamp(6) without time zone,
    weight double precision,
    category_id bigint NOT NULL,
    depth_cm double precision,
    height_cm double precision,
    model_3d_url character varying(500),
    room_placement_role character varying(30),
    width_cm double precision
);


--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.products ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.products_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id bigint NOT NULL,
    name character varying(50) NOT NULL
);


--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.roles ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: showroom_appointments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.showroom_appointments (
    id bigint NOT NULL,
    appointment_date date NOT NULL,
    appointment_time character varying(50),
    created_at timestamp(6) without time zone,
    customer_name character varying(100) NOT NULL,
    note text,
    phone character varying(20) NOT NULL,
    status character varying(30) NOT NULL,
    updated_at timestamp(6) without time zone,
    product_id bigint,
    CONSTRAINT showroom_appointments_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'CONFIRMED'::character varying, 'COMPLETED'::character varying, 'CANCELLED'::character varying])::text[])))
);


--
-- Name: showroom_appointments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.showroom_appointments ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.showroom_appointments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: user_preferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_preferences (
    id bigint NOT NULL,
    budget_range character varying(100),
    created_at timestamp(6) without time zone,
    favorite_materials character varying(255),
    preferred_style character varying(100),
    room_type character varying(100),
    session_id character varying(100),
    summary text,
    updated_at timestamp(6) without time zone,
    user_id bigint
);


--
-- Name: user_preferences_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.user_preferences ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.user_preferences_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    address character varying(255),
    avatar_url character varying(500),
    created_at timestamp(6) without time zone,
    email character varying(100) NOT NULL,
    full_name character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    phone character varying(20),
    status character varying(20) NOT NULL,
    updated_at timestamp(6) without time zone,
    role_id bigint NOT NULL,
    CONSTRAINT users_status_check CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'BLOCKED'::character varying])::text[])))
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.users ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: vouchers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vouchers (
    id bigint NOT NULL,
    code character varying(32) NOT NULL,
    created_at timestamp(6) without time zone,
    description text,
    discount_type character varying(20) NOT NULL,
    discount_value numeric(12,2) NOT NULL,
    end_date timestamp(6) without time zone,
    is_active boolean NOT NULL,
    max_discount_amount numeric(12,2),
    min_order_value numeric(12,2),
    start_date timestamp(6) without time zone,
    title character varying(255) NOT NULL,
    updated_at timestamp(6) without time zone,
    usage_limit integer NOT NULL,
    used_count integer NOT NULL,
    CONSTRAINT vouchers_discount_type_check CHECK (((discount_type)::text = ANY ((ARRAY['PERCENTAGE'::character varying, 'FIXED_AMOUNT'::character varying])::text[])))
);


--
-- Name: vouchers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.vouchers ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.vouchers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: wishlists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wishlists (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone,
    product_id bigint NOT NULL,
    user_id bigint NOT NULL
);


--
-- Name: wishlists_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.wishlists ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.wishlists_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cart_items (id, price, quantity, cart_id, product_id) FROM stdin;
1	25900000.00	1	1	1
2	4650000.00	1	1	5
3	2950000.00	1	1	13
4	11200000.00	1	1	12
5	5900000.00	1	1	14
\.


--
-- Data for Name: carts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.carts (id, created_at, updated_at, user_id) FROM stdin;
1	2026-09-04 20:12:27.401235	2026-09-04 20:12:27.401235	1
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categories (id, created_at, description, display_order, image_url, name, slug, updated_at) FROM stdin;
1	2026-09-04 19:16:06.760403	Bộ sưu tập sofa góc, sofa băng nỉ, ghế bành đơn cao cấp sang trọng cho phòng khách	1	https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80	Sofa & Ghế Thư Giãn	sofa-ghe-thu-gian	2026-09-04 19:16:06.760403
2	2026-09-04 19:16:06.769389	Bàn ăn gỗ óc chó nguyên tấm, bàn mặt đá ceramic chống xước và bàn trà hiện đại	2	https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80	Bàn Ăn & Bàn Trà	ban-an-ban-tra	2026-09-04 19:16:06.769389
3	2026-09-04 19:16:06.771732	Giường ngủ gỗ sồi tự nhiên, giường bọc da Nappa và vải nỉ kháng khuẩn phong cách Bắc Âu	3	https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80	Giường Ngủ Cao Cấp	giuong-ngu-cao-cap	2026-09-04 19:16:06.771732
4	2026-09-04 19:16:06.775181	Tủ áo cánh kính viền nhôm đèn LED, kệ trang trí phong cách tối giản tiện nghi	4	https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80	Tủ Quần Áo & Kệ Sách	tu-quan-ao-ke-sach	2026-09-04 19:16:06.775181
5	2026-09-04 19:16:06.778222	Bàn làm việc thông minh nâng hạ điện tử, ghế công thái học bảo vệ cột sống	5	https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80	Bàn Ghế Làm Việc	ban-ghe-lam-viec	2026-09-04 19:16:06.778222
\.


--
-- Data for Name: chat_messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chat_messages (id, content, created_at, product_metadata, sender, session_id) FROM stdin;
1	Tư vấn sofa da Ý cho phòng khách hiện đại	2026-09-04 19:18:07.962948	\N	USER	c4baba67-da74-47e4-a70b-c60bd229481a
2	Dạ chào bạn! Showroom Nội thất Phú Quý xin giới thiệu đến bạn các mẫu nội thất cao cấp rất phù hợp với nhu cầu của bạn:\n\n✨ **Sofa Góc Chữ L Da Bò Ý Cao Cấp Florence**\n- **Giá ưu đãi:** `25,900,000 VNĐ`\n- **Chất liệu:** Da bò Ý Mastrotto, khung gỗ sồi Nga sấy, mút nguyên khối D40\n- **Kích thước:** 280cm x 170cm x 85cm (Dài x Rộng x Cao)\n- **Màu sắc:** Nâu Cognac sang trọng\n- **Tình trạng:** Còn hàng sẵn tại showroom\n- **Điểm nổi bật:** Sofa góc Florence được gia công tỉ mỉ từ 100% da bò tự nhiên nhập khẩu trực tiếp từ Ý. Khung sườn gỗ sồi tự nhiên sấy khô chống mối mọt cong vênh vĩnh viễn, đệm mút cao su non êm ái chống xẹp lún. Thiết kế hiện đại mang lại đẳng cấp hoàng gia cho phòng khách rộng.\n\n✨ **Bàn Trà Đôi Mặt Đá Ceramic Chống Xước Vân Mây Venus**\n- **Giá ưu đãi:** `4,650,000 VNĐ`\n- **Chất liệu:** Mặt đá phiến ceramic Italy, kính cường lực, chân thép sơn tĩnh điện\n- **Kích thước:** Bàn lớn: D70cm x H45cm; Bàn nhỏ: D50cm x H40cm\n- **Màu sắc:** Trắng vân mây + Kính trà\n- **Tình trạng:** Còn hàng sẵn tại showroom\n- **Điểm nổi bật:** Bộ bàn trà đôi lồng ghép gồm 1 bàn lớn mặt đá ceramic chống ố chống va đập và 1 bàn nhỏ mặt kính cường lực trà. Chân thép sơn tĩnh điện đen mờ phong cách tối giản.\n\n✨ **Giường Ngủ Gỗ Sồi Tự Nhiên Tối Giản Kiểu Nhật Tatami**\n- **Giá ưu đãi:** `13,200,000 VNĐ`\n- **Chất liệu:** 100% Gỗ sồi trắng (White Oak) tự nhiên nhập khẩu\n- **Kích thước:** 160cm x 200cm (Lọt lòng đệm)\n- **Màu sắc:** Màu gỗ sồi sáng tự nhiên\n- **Tình trạng:** Còn hàng sẵn tại showroom\n- **Điểm nổi bật:** Thiết kế gầm thấp phong cách Zen Nhật Bản. Từng đường nét mộng gỗ tinh xảo, tôn vinh sắc vàng ấm áp của gỗ sồi tự nhiên. Đầu giường có hộc để sách và tích hợp cổng sạc USB tiện dụng.\n\n✨ **Sofa Băng 3 Chỗ Vải Nỉ Bắc Âu Scandinavian Oslo**\n- **Giá ưu đãi:** `11,200,000 VNĐ`\n- **Chất liệu:** Vải nỉ nhung Bỉ chống thấm, khung gỗ tần bì, đệm lông vũ kết hợp bông ép\n- **Kích thước:** 210cm x 85cm x 80cm\n- **Màu sắc:** Xám tro nhạt (Light Grey)\n- **Tình trạng:** Còn hàng sẵn tại showroom\n- **Điểm nổi bật:** Phong cách thiết kế Scandinavian tinh giản từ Đan Mạch. Vải nỉ nhung dệt thoi kháng nước, dễ lau chùi khi đổ cà phê hoặc chất lỏng. Chân gỗ sồi tiện tròn thanh thoát, phù hợp hoàn hảo với các căn hộ chung cư hoặc phòng khách diện tích vừa và nhỏ.\n\n💡 *Lời khuyên từ chuyên viên Phú Quý:* Các mẫu trên đều được bảo hành chính hãng 3 năm và miễn phí vận chuyển, lắp đặt tại nhà. Bạn có muốn xem thêm chi tiết hoặc cần tư vấn về cách bố trí trong phòng không ạ?	2026-09-04 19:18:24.377125	[{"id":1,"name":"Sofa Góc Chữ L Da Bò Ý Cao Cấp Florence","slug":"sofa-goc-chu-l-da-bo-y-florence","price":28500000.00,"discountPrice":25900000.00,"material":"Da bò Ý Mastrotto, khung gỗ sồi Nga sấy, mút nguyên khối D40","dimensions":"280cm x 170cm x 85cm (Dài x Rộng x Cao)","thumbnail":"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80","stockQuantity":12},{"id":5,"name":"Bàn Trà Đôi Mặt Đá Ceramic Chống Xước Vân Mây Venus","slug":"ban-tra-doi-mat-da-ceramic-venus","price":5200000.00,"discountPrice":4650000.00,"material":"Mặt đá phiến ceramic Italy, kính cường lực, chân thép sơn tĩnh điện","dimensions":"Bàn lớn: D70cm x H45cm; Bàn nhỏ: D50cm x H40cm","thumbnail":"https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80","stockQuantity":25},{"id":7,"name":"Giường Ngủ Gỗ Sồi Tự Nhiên Tối Giản Kiểu Nhật Tatami","slug":"giuong-ngu-go-soi-tatami-nhat-ban","price":14500000.00,"discountPrice":13200000.00,"material":"100% Gỗ sồi trắng (White Oak) tự nhiên nhập khẩu","dimensions":"160cm x 200cm (Lọt lòng đệm)","thumbnail":"https://images.unsplash.com/photo-1540518614846-7ede433c4ef2?auto=format&fit=crop&w=800&q=80","stockQuantity":14},{"id":2,"name":"Sofa Băng 3 Chỗ Vải Nỉ Bắc Âu Scandinavian Oslo","slug":"sofa-bang-vai-ni-bac-au-oslo","price":12800000.00,"discountPrice":11200000.00,"material":"Vải nỉ nhung Bỉ chống thấm, khung gỗ tần bì, đệm lông vũ kết hợp bông ép","dimensions":"210cm x 85cm x 80cm","thumbnail":"https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80","stockQuantity":20}]	ASSISTANT	c4baba67-da74-47e4-a70b-c60bd229481a
3	Tư vấn sofa da Ý cho phòng khách hiện đại	2026-09-05 15:30:16.297357	\N	USER	befdfbd4-2e12-41cc-9d01-67de4fc31e46
4	Dạ chào bạn! Showroom Nội thất Phú Quý xin giới thiệu đến bạn các mẫu nội thất cao cấp rất phù hợp với nhu cầu của bạn:\n\n✨ **Sofa Góc Chữ L Da Bò Ý Cao Cấp Florence**\n- **Giá ưu đãi:** `25,900,000 VNĐ`\n- **Chất liệu:** Da bò Ý Mastrotto, khung gỗ sồi Nga sấy, mút nguyên khối D40\n- **Kích thước:** 280cm x 170cm x 85cm (Dài x Rộng x Cao)\n- **Màu sắc:** Nâu Cognac sang trọng\n- **Tình trạng:** Còn hàng sẵn tại showroom\n- **Điểm nổi bật:** Sofa góc Florence được gia công tỉ mỉ từ 100% da bò tự nhiên nhập khẩu trực tiếp từ Ý. Khung sườn gỗ sồi tự nhiên sấy khô chống mối mọt cong vênh vĩnh viễn, đệm mút cao su non êm ái chống xẹp lún. Thiết kế hiện đại mang lại đẳng cấp hoàng gia cho phòng khách rộng.\n\n✨ **Đèn Cây Đứng Vòm Cung Cần Inox Arco Luxury**\n- **Giá ưu đãi:** `5,900,000 VNĐ`\n- **Chất liệu:** Inox 304 xước mờ, chân đế đá tự nhiên Carrara\n- **Kích thước:** 45cm x 45cm x 185cm\n- **Màu sắc:** Bạc kim loại & Đá trắng\n- **Tình trạng:** Còn hàng sẵn tại showroom\n- **Điểm nổi bật:** Đèn cây uốn vòm chân đế đá cẩm thạch trắng Carrara nguyên khối nặng 35kg vững chãi. Cần đèn inox 304 sáng bóng điều chỉnh vươn xa 2m.\n\n✨ **Giường Ngủ Gỗ Sồi Tự Nhiên Tối Giản Kiểu Nhật Tatami**\n- **Giá ưu đãi:** `13,200,000 VNĐ`\n- **Chất liệu:** 100% Gỗ sồi trắng (White Oak) tự nhiên nhập khẩu\n- **Kích thước:** 160cm x 200cm (Lọt lòng đệm)\n- **Màu sắc:** Màu gỗ sồi sáng tự nhiên\n- **Tình trạng:** Còn hàng sẵn tại showroom\n- **Điểm nổi bật:** Thiết kế gầm thấp phong cách Zen Nhật Bản. Từng đường nét mộng gỗ tinh xảo, tôn vinh sắc vàng ấm áp của gỗ sồi tự nhiên. Đầu giường có hộc để sách và tích hợp cổng sạc USB tiện dụng.\n\n✨ **Bàn Trà Đôi Mặt Đá Ceramic Chống Xước Vân Mây Venus**\n- **Giá ưu đãi:** `4,650,000 VNĐ`\n- **Chất liệu:** Mặt đá phiến ceramic Italy, kính cường lực, chân thép sơn tĩnh điện\n- **Kích thước:** Bàn lớn: D70cm x H45cm; Bàn nhỏ: D50cm x H40cm\n- **Màu sắc:** Trắng vân mây + Kính trà\n- **Tình trạng:** Còn hàng sẵn tại showroom\n- **Điểm nổi bật:** Bộ bàn trà đôi lồng ghép gồm 1 bàn lớn mặt đá ceramic chống ố chống va đập và 1 bàn nhỏ mặt kính cường lực trà. Chân thép sơn tĩnh điện đen mờ phong cách tối giản.\n\n💡 *Lời khuyên từ chuyên viên Phú Quý:* Các mẫu trên đều được bảo hành chính hãng 3 năm và miễn phí vận chuyển, lắp đặt tại nhà. Bạn có muốn xem thêm chi tiết hoặc cần tư vấn về cách bố trí trong phòng không ạ?	2026-09-05 15:30:31.809302	[{"id":1,"name":"Sofa Góc Chữ L Da Bò Ý Cao Cấp Florence","slug":"sofa-goc-chu-l-da-bo-y-florence","price":28500000.00,"discountPrice":25900000.00,"material":"Da bò Ý Mastrotto, khung gỗ sồi Nga sấy, mút nguyên khối D40","dimensions":"280cm x 170cm x 85cm (Dài x Rộng x Cao)","thumbnail":"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80","stockQuantity":12},{"id":14,"name":"Đèn Cây Đứng Vòm Cung Cần Inox Arco Luxury","slug":"den-cay-dung-arco-lamp","price":6800000.00,"discountPrice":5900000.00,"material":"Inox 304 xước mờ, chân đế đá tự nhiên Carrara","dimensions":"45cm x 45cm x 185cm","thumbnail":"https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80","stockQuantity":10},{"id":7,"name":"Giường Ngủ Gỗ Sồi Tự Nhiên Tối Giản Kiểu Nhật Tatami","slug":"giuong-ngu-go-soi-tatami-nhat-ban","price":14500000.00,"discountPrice":13200000.00,"material":"100% Gỗ sồi trắng (White Oak) tự nhiên nhập khẩu","dimensions":"160cm x 200cm (Lọt lòng đệm)","thumbnail":"https://images.unsplash.com/photo-1540518614846-7ede433c4ef2?auto=format&fit=crop&w=800&q=80","stockQuantity":14},{"id":5,"name":"Bàn Trà Đôi Mặt Đá Ceramic Chống Xước Vân Mây Venus","slug":"ban-tra-doi-mat-da-ceramic-venus","price":5200000.00,"discountPrice":4650000.00,"material":"Mặt đá phiến ceramic Italy, kính cường lực, chân thép sơn tĩnh điện","dimensions":"Bàn lớn: D70cm x H45cm; Bàn nhỏ: D50cm x H40cm","thumbnail":"https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80","stockQuantity":25}]	ASSISTANT	befdfbd4-2e12-41cc-9d01-67de4fc31e46
\.


--
-- Data for Name: chat_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chat_sessions (id, created_at, session_token, title, updated_at, user_id) FROM stdin;
c4baba67-da74-47e4-a70b-c60bd229481a	2026-09-04 19:18:07.912777	\N	Cuộc trò chuyện tư vấn	2026-09-04 19:18:07.912777	\N
befdfbd4-2e12-41cc-9d01-67de4fc31e46	2026-09-05 15:30:16.250891	\N	Cuộc trò chuyện tư vấn	2026-09-05 15:30:16.250891	\N
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_items (id, product_name, product_thumbnail, quantity, total_price, unit_price, order_id, product_id) FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (id, created_at, note, order_code, payment_method, payment_status, recipient_name, recipient_phone, shipping_address, shipping_fee, status, total_amount, updated_at, user_id, discount_amount, voucher_code) FROM stdin;
\.


--
-- Data for Name: payment_transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payment_transactions (id, amount, bank_code, card_type, created_at, order_code, order_info, pay_date, payment_method, response_code, status, transaction_no, order_id) FROM stdin;
\.


--
-- Data for Name: product_reviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_reviews (id, comment, created_at, moderation_reason, rating, status, product_id, user_id) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, color, created_at, description, dimensions, discount_price, embedding, images, is_active, is_featured, material, name, price, slug, stock_quantity, thumbnail, updated_at, weight, category_id, depth_cm, height_cm, model_3d_url, room_placement_role, width_cm) FROM stdin;
10	Mặt gỗ vàng nhạt - Khung trắng	2026-09-04 19:16:06.830166	Bàn làm việc công thái học chuyển đổi linh hoạt tư thế đứng và ngồi. Động cơ kép Dual Motor êm ái dưới 45dB, bảng điều khiển cảm ứng ghi nhớ 4 vị trí độ cao, tích hợp cảm biến chống va chạm an toàn.	140cm x 70cm (Độ cao nâng hạ 65cm - 125cm)	8650000.00	\N	https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80	t	t	Mặt bàn gỗ sồi ghép thanh tự nhiên dày 25mm, khung thép cán nguội SPCC	Bàn Làm Việc Nâng Hạ Điện Tử Thông Minh SmartDesk Pro	9800000.00	ban-lam-viec-nang-ha-dien-tu-smartdesk-pro	16	https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80	2026-09-04 20:16:54.913563	42	5	70	75	/models/desk.glb	DESK	140
1	Nâu Cognac sang trọng	2026-09-04 19:16:06.786045	Sofa góc Florence được gia công tỉ mỉ từ 100% da bò tự nhiên nhập khẩu trực tiếp từ Ý. Khung sườn gỗ sồi tự nhiên sấy khô chống mối mọt cong vênh vĩnh viễn, đệm mút cao su non êm ái chống xẹp lún. Thiết kế hiện đại mang lại đẳng cấp hoàng gia cho phòng khách rộng.	280cm x 170cm x 85cm (Dài x Rộng x Cao)	25900000.00	\N	https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80,https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80	t	t	Da bò Ý Mastrotto, khung gỗ sồi Nga sấy, mút nguyên khối D40	Sofa Góc Chữ L Da Bò Ý Cao Cấp Florence	28500000.00	sofa-goc-chu-l-da-bo-y-florence	12	https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80	2026-09-04 20:04:45.594344	85	1	170	85	/models/sofa.glb	SOFA	280
2	Xám tro nhạt (Light Grey)	2026-09-04 19:16:06.798353	Phong cách thiết kế Scandinavian tinh giản từ Đan Mạch. Vải nỉ nhung dệt thoi kháng nước, dễ lau chùi khi đổ cà phê hoặc chất lỏng. Chân gỗ sồi tiện tròn thanh thoát, phù hợp hoàn hảo với các căn hộ chung cư hoặc phòng khách diện tích vừa và nhỏ.	210cm x 85cm x 80cm	11200000.00	\N	https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80	t	t	Vải nỉ nhung Bỉ chống thấm, khung gỗ tần bì, đệm lông vũ kết hợp bông ép	Sofa Băng 3 Chỗ Vải Nỉ Bắc Âu Scandinavian Oslo	12800000.00	sofa-bang-vai-ni-bac-au-oslo	20	https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80	2026-09-04 20:04:45.594344	48	1	85	80	/models/sofa.glb	SOFA	210
3	Đen Huyền Bí	2026-09-04 19:16:06.802875	Biểu tượng trường tồn của nội thất hiện đại. Phần đệm ngồi bọc da microfiber dập quả trám sang chảnh, khung thép không gỉ nguyên khối uốn lượn mạ PVD vàng gương bóng loáng.	78cm x 80cm x 75cm	5990000.00	\N	https://images.unsplash.com/photo-1580481077195-c3a821a58875?auto=format&fit=crop&w=800&q=80	t	f	Khung inox 304 mạ PVD vàng, da Nappa cao cấp	Ghế Thư Giãn Đơn Armchair Chân Inox Mạ Vàng Barcelona	6900000.00	ghe-thu-gian-armchair-barcelona	15	https://images.unsplash.com/photo-1580481077195-c3a821a58875?auto=format&fit=crop&w=800&q=80	2026-09-04 20:04:45.594344	22	1	85	82	/models/chair.glb	SOFA	85
4	Nâu hạt dẻ trầm ấm	2026-09-04 19:16:06.812256	Bộ bàn ăn gia đình 6 người đẳng cấp với vân gỗ óc chó cuộn sóng 3D quyến rũ. Sơn phủ Inchem Mỹ 5 lớp giữ màu tự nhiên mộc mạc và chống xước tối ưu. Ghế ăn tựa lưng công thái học bọc da cao cấp.	Bàn: 180cm x 90cm x 75cm; Ghế: 48cm x 52cm x 85cm	31900000.00	\N	https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80	t	t	100% Gỗ óc chó Walnut nhập khẩu Bắc Mỹ, da Microfiber	Bộ Bàn Ăn Gỗ Óc Chó Tự Nhiên Bắc Mỹ Kèm 6 Ghế Royal	34500000.00	bo-ban-an-go-oc-cho-kem-6-ghe-royal	8	https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80	2026-09-04 20:04:45.595344	95	2	90	76	/models/table.glb	DINING_TABLE	180
5	Trắng vân mây + Kính trà	2026-09-04 19:16:06.815344	Bộ bàn trà đôi lồng ghép gồm 1 bàn lớn mặt đá ceramic chống ố chống va đập và 1 bàn nhỏ mặt kính cường lực trà. Chân thép sơn tĩnh điện đen mờ phong cách tối giản.	Bàn lớn: D70cm x H45cm; Bàn nhỏ: D50cm x H40cm	4650000.00	\N	https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80	t	f	Mặt đá phiến ceramic Italy, kính cường lực, chân thép sơn tĩnh điện	Bàn Trà Đôi Mặt Đá Ceramic Chống Xước Vân Mây Venus	5200000.00	ban-tra-doi-mat-da-ceramic-venus	25	https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80	2026-09-04 20:04:45.595344	28	2	60	45	/models/coffee-table.glb	COFFEE_TABLE	110
6	Xám khói thanh lịch	2026-09-04 19:16:06.817865	Chiếc giường mang lại giấc ngủ thư thái tựa khách sạn 5 sao. Đầu giường bọc đệm êm ái dày 15cm tạo điểm tựa thoải mái khi đọc sách hoặc xem tivi. Giát giường khung thép chịu tải trọng trên 500kg.	180cm x 200cm (Kích thước lọt đệm)	17900000.00	\N	https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80	t	t	Vải nỉ Bỉ cao cấp, khung gỗ thông tự nhiên kết hợp thép cường lực	Giường Ngủ Bọc Nệm Nỉ Phong Cách Ý Luxury Grand	19800000.00	giuong-ngu-boc-nem-ni-luxury-grand	10	https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80	2026-09-04 20:04:45.595344	75	3	200	110	/models/bed.glb	BED	180
7	Màu gỗ sồi sáng tự nhiên	2026-09-04 19:16:06.822603	Thiết kế gầm thấp phong cách Zen Nhật Bản. Từng đường nét mộng gỗ tinh xảo, tôn vinh sắc vàng ấm áp của gỗ sồi tự nhiên. Đầu giường có hộc để sách và tích hợp cổng sạc USB tiện dụng.	160cm x 200cm (Lọt lòng đệm)	13200000.00	\N	https://images.unsplash.com/photo-1540518614846-7ede433c4ef2?auto=format&fit=crop&w=800&q=80	t	f	100% Gỗ sồi trắng (White Oak) tự nhiên nhập khẩu	Giường Ngủ Gỗ Sồi Tự Nhiên Tối Giản Kiểu Nhật Tatami	14500000.00	giuong-ngu-go-soi-tatami-nhat-ban	14	https://images.unsplash.com/photo-1540518614846-7ede433c4ef2?auto=format&fit=crop&w=800&q=80	2026-09-04 20:04:45.595344	60	3	200	110	/models/bed.glb	BED	180
12	Nâu trầm tự nhiên	2026-09-04 20:04:45.635125	Kệ tivi thiết kế thấp hiện đại tối giản với 3 ngăn kéo hít giảm chấn Hafele. Mặt gỗ óc chó vân núi phủ dầu sáp Osmo an toàn sức khỏe.	180cm x 42cm x 45cm	11200000.00	\N	\N	t	t	Gỗ óc chó Bắc Mỹ nhập khẩu FAS	Kệ Tivi Gỗ Óc Chó Tự Nhiên Bắc Mỹ Grand	12500000.00	ke-tivi-go-oc-cho-sony	15	https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80	2026-09-04 20:04:45.635125	\N	4	42	45	/models/tv-stand.glb	TV_STAND	180
14	Bạc kim loại & Đá trắng	2026-09-04 20:04:45.662579	Đèn cây uốn vòm chân đế đá cẩm thạch trắng Carrara nguyên khối nặng 35kg vững chãi. Cần đèn inox 304 sáng bóng điều chỉnh vươn xa 2m.	45cm x 45cm x 185cm	5900000.00	\N	\N	t	t	Inox 304 xước mờ, chân đế đá tự nhiên Carrara	Đèn Cây Đứng Vòm Cung Cần Inox Arco Luxury	6800000.00	den-cay-dung-arco-lamp	10	https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80	2026-09-04 20:04:45.662579	\N	1	45	185	/models/lamp.glb	FLOOR_LAMP	45
11	Xám Không Gian (Space Grey)	2026-09-04 19:16:06.833394	Giải pháp bảo vệ cột sống và cổ vai gáy cho người làm việc văn phòng 8-12 tiếng mỗi ngày. Tựa lưng 3D điều chỉnh theo độ cong sinh lý của lưng, đệm ngồi trượt ngả lưng 135 độ, lưới Wintex nhập khẩu Hàn Quốc không giãn xệ.	68cm x 68cm x 115-125cm	5500000.00	\N	https://images.unsplash.com/photo-1589384267710-7a25a5895780?auto=format&fit=crop&w=800&q=80	t	t	Lưới Wintex Hàn Quốc, chân hợp kim nhôm đúc nguyên khối, Piston Class 4 chứng nhận BIFMA	Ghế Công Thái Học Lưới Thoáng Khí Ergonomic Master Chair	6500000.00	ghe-cong-thai-hoc-luoi-ergonomic-master	22	https://images.unsplash.com/photo-1589384267710-7a25a5895780?auto=format&fit=crop&w=800&q=80	2026-09-04 20:16:54.913563	21	5	65	115	/models/office-chair.glb	OFFICE_CHAIR	65
8	Kính trà viền nhôm đen	2026-09-04 19:16:06.824616	Đỉnh cao nội thất phòng ngủ hiện đại. Thùng tủ gỗ MDF chống ẩm An Cường phủ Melamine chống trầy xước. Cánh kính cường lực viền nhôm xước màu đen mờ kết hợp dải LED cảm biến đóng mở cửa thông minh.	240cm x 60cm x 240cm (Dài x Sâu x Cao)	20500000.00	\N	https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80	t	t	Gỗ MDF lõi xanh chống ẩm An Cường, cánh kính cường lực 5mm, khung nhôm Xingfa	Tủ Quần Áo Cánh Kính Cường Lực Đèn LED Cảm Ứng Lumina	22500000.00	tu-quan-ao-canh-kinh-cuong-luc-lumina	7	https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80	2026-09-04 20:16:54.913563	130	4	60	210	/models/wardrobe.glb	WARDROBE	180
9	Khung đen - Gỗ nâu cánh gián	2026-09-04 19:16:06.828152	Kệ trang trí phong cách công nghiệp cá tính với 5 tầng bày sách, lọ hoa, mô hình hoặc tranh ảnh. Khung thép hộp dày chịu lực cực tốt, các đợt gỗ tự nhiên phủ dầu lau bóng mịn.	120cm x 35cm x 180cm	4200000.00	\N	https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80	t	f	Khung thép sơn tĩnh điện chống rỉ, đợt gỗ cao su tự nhiên chuẩn AA	Kệ Sách Và Đồ Trang Trí Khung Thép Sơn Tĩnh Điện Loft Industrial	4800000.00	ke-sach-trang-tri-khung-thep-loft	18	https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80	2026-09-04 20:16:54.913563	35	4	35	185	/models/shelf.glb	BOOKSHELF	110
13	Xám trắng họa tiết hình học	2026-09-04 20:04:45.657204	Thảm dệt sợi Polyester mật độ cao êm ái chống bám bụi và chống trượt tuyệt đối. Họa tiết hình học Scandi tối giản.	240cm x 160cm x 1.5cm	2950000.00	\N	\N	t	t	Sợi nỉ tổng hợp kháng khuẩn, đế cao su TPR chống trượt	Thảm Trải Sàn Nỉ Lông Ngắn Họa Tiết Bắc Âu Nordic	3500000.00	tham-sofa-scandinavian-nordic	25	https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80	2026-09-04 20:18:42.29165	\N	1	160	2	/models/rug.glb	RUG	240
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.roles (id, name) FROM stdin;
1	ROLE_CUSTOMER
2	ROLE_ADMIN
\.


--
-- Data for Name: showroom_appointments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.showroom_appointments (id, appointment_date, appointment_time, created_at, customer_name, note, phone, status, updated_at, product_id) FROM stdin;
\.


--
-- Data for Name: user_preferences; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_preferences (id, budget_range, created_at, favorite_materials, preferred_style, room_type, session_id, summary, updated_at, user_id) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, address, avatar_url, created_at, email, full_name, password, phone, status, updated_at, role_id) FROM stdin;
1	Showroom Phú Quý, 88 Xa Lộ Hà Nội, TP. Thủ Đức, TP. HCM	https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80	2026-09-04 19:16:06.596333	admin@phuquy.com	Quản Trị Viên Phú Quý	$2a$10$kgiwIA/jizjpn5rz0UeQkunMD95QT3u9cstaSj/pvIA7blRFeSBE2	0909123456	ACTIVE	2026-09-04 19:16:06.596333	2
2	Số 123 Đường Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh	https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80	2026-09-04 19:16:06.70785	khachhang@gmail.com	Nguyễn Văn An	$2a$10$2j.IgADsfswCBLd4vYmnZeMZLYx1dIwn5MfbmVN369TodD1qV2rz2	0987654321	ACTIVE	2026-09-04 19:16:06.70785	1
\.


--
-- Data for Name: vouchers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vouchers (id, code, created_at, description, discount_type, discount_value, end_date, is_active, max_discount_amount, min_order_value, start_date, title, updated_at, usage_limit, used_count) FROM stdin;
1	PHUQUY10	2026-09-04 19:38:54.50404	Áp dụng cho mọi đơn hàng nội thất phòng khách, phòng ngủ từ 5 triệu đồng trở lên.	PERCENTAGE	10.00	2026-12-04 19:38:54.481179	t	2000000.00	5000000.00	2026-08-25 19:38:54.481179	Giảm 10% Toàn Bộ Đơn Hàng (Tối đa 2.000.000đ)	2026-09-04 19:38:54.50404	200	8
2	PHUQUY500	2026-09-04 19:38:54.546299	Ưu đãi đặc quyền chào đón khách hàng mới khi mua sắm tại showroom online Phú Quý.	FIXED_AMOUNT	500000.00	2026-11-04 19:38:54.481723	t	\N	3000000.00	2026-08-30 19:38:54.481723	Giảm Trực Tiếp 500.000đ Đơn Hàng Đầu Tiên	2026-09-04 19:38:54.546299	150	12
3	FREESHIP	2026-09-04 19:38:54.549317	Hỗ trợ cước vận chuyển giao hàng tận nơi cho đơn từ 1 triệu đồng.	FIXED_AMOUNT	150000.00	2027-03-04 19:38:54.481723	t	\N	1000000.00	2026-08-20 19:38:54.481723	Miễn Phí Vận Chuyển & Lắp Đặt Tận Nhà (150.000đ)	2026-09-04 19:38:54.549317	500	35
\.


--
-- Data for Name: wishlists; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.wishlists (id, created_at, product_id, user_id) FROM stdin;
\.


--
-- Name: cart_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.cart_items_id_seq', 5, true);


--
-- Name: carts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.carts_id_seq', 1, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.categories_id_seq', 5, true);


--
-- Name: chat_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.chat_messages_id_seq', 4, true);


--
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.order_items_id_seq', 1, false);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.orders_id_seq', 1, false);


--
-- Name: payment_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.payment_transactions_id_seq', 1, false);


--
-- Name: product_reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.product_reviews_id_seq', 1, false);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.products_id_seq', 14, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.roles_id_seq', 2, true);


--
-- Name: showroom_appointments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.showroom_appointments_id_seq', 1, false);


--
-- Name: user_preferences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_preferences_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- Name: vouchers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.vouchers_id_seq', 3, true);


--
-- Name: wishlists_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.wishlists_id_seq', 1, false);


--
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- Name: carts carts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- Name: chat_sessions chat_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_sessions
    ADD CONSTRAINT chat_sessions_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: payment_transactions payment_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_pkey PRIMARY KEY (id);


--
-- Name: product_reviews product_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_reviews
    ADD CONSTRAINT product_reviews_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: showroom_appointments showroom_appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.showroom_appointments
    ADD CONSTRAINT showroom_appointments_pkey PRIMARY KEY (id);


--
-- Name: vouchers uk30ftp2biebbvpik8e49wlmady; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vouchers
    ADD CONSTRAINT uk30ftp2biebbvpik8e49wlmady UNIQUE (code);


--
-- Name: carts uk64t7ox312pqal3p7fg9o503c2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT uk64t7ox312pqal3p7fg9o503c2 UNIQUE (user_id);


--
-- Name: users uk6dotkott2kjsp8vw4d0m25fb7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uk6dotkott2kjsp8vw4d0m25fb7 UNIQUE (email);


--
-- Name: orders ukdhk2umg8ijjkg4njg6891trit; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT ukdhk2umg8ijjkg4njg6891trit UNIQUE (order_code);


--
-- Name: wishlists ukht6e6158srxsvjciahp1kjywf; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT ukht6e6158srxsvjciahp1kjywf UNIQUE (user_id, product_id);


--
-- Name: roles ukofx66keruapi6vyqpv6f2or37; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT ukofx66keruapi6vyqpv6f2or37 UNIQUE (name);


--
-- Name: products ukostq1ec3toafnjok09y9l7dox; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT ukostq1ec3toafnjok09y9l7dox UNIQUE (slug);


--
-- Name: categories ukoul14ho7bctbefv8jywp5v3i2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT ukoul14ho7bctbefv8jywp5v3i2 UNIQUE (slug);


--
-- Name: user_preferences user_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT user_preferences_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vouchers vouchers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vouchers
    ADD CONSTRAINT vouchers_pkey PRIMARY KEY (id);


--
-- Name: wishlists wishlists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_pkey PRIMARY KEY (id);


--
-- Name: cart_items fk1re40cjegsfvw58xrkdp6bac6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT fk1re40cjegsfvw58xrkdp6bac6 FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: orders fk32ql8ubntj5uh44ph9659tiih; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fk32ql8ubntj5uh44ph9659tiih FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: wishlists fk330pyw2el06fn5g28ypyljt16; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT fk330pyw2el06fn5g28ypyljt16 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: product_reviews fk35kxxqe2g9r4mww80w9e3tnw9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_reviews
    ADD CONSTRAINT fk35kxxqe2g9r4mww80w9e3tnw9 FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: chat_messages fk3cpkdtwdxndrjhrx3gt9q5ux9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT fk3cpkdtwdxndrjhrx3gt9q5ux9 FOREIGN KEY (session_id) REFERENCES public.chat_sessions(id);


--
-- Name: product_reviews fk58i39bhws2hss3tbcvdmrm60f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_reviews
    ADD CONSTRAINT fk58i39bhws2hss3tbcvdmrm60f FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: chat_sessions fk82ky97glaomlmhjqae1d0esmy; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_sessions
    ADD CONSTRAINT fk82ky97glaomlmhjqae1d0esmy FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: carts fkb5o626f86h46m4s7ms6ginnop; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT fkb5o626f86h46m4s7ms6ginnop FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: order_items fkbioxgbv59vetrxe0ejfubep1w; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT fkbioxgbv59vetrxe0ejfubep1w FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: user_preferences fkepakpib0qnm82vmaiismkqf88; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT fkepakpib0qnm82vmaiismkqf88 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: wishlists fkl7ao98u2bm8nijc1rv4jobcrx; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT fkl7ao98u2bm8nijc1rv4jobcrx FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: payment_transactions fknsous9qyrjv5ss8que6o6617; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT fknsous9qyrjv5ss8que6o6617 FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: order_items fkocimc7dtr037rh4ls4l95nlfi; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT fkocimc7dtr037rh4ls4l95nlfi FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: products fkog2rp4qthbtt2lfyhfo32lsw9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT fkog2rp4qthbtt2lfyhfo32lsw9 FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: users fkp56c1712k691lhsyewcssf40f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fkp56c1712k691lhsyewcssf40f FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- Name: cart_items fkpcttvuq4mxppo8sxggjtn5i2c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT fkpcttvuq4mxppo8sxggjtn5i2c FOREIGN KEY (cart_id) REFERENCES public.carts(id);


--
-- Name: showroom_appointments fksky6qlr5ag072c22qj511no0i; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.showroom_appointments
    ADD CONSTRAINT fksky6qlr5ag072c22qj511no0i FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- PostgreSQL database dump complete
--

\unrestrict R8YhAlrJGg3HbUfCuRid8yN2hD6okvwtVDebhS1a6uOMu9Huw2UgGQ97IIh5DZn

