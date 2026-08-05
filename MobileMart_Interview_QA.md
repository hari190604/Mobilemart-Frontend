# MobileMart - 50 Technical Interview Questions & Answers

## I. Architecture & System Design
**1. How would you describe the overall architecture of the MobileMart platform?**
MobileMart follows a decoupled client-server architecture. The frontend is a Single Page Application (SPA) built with React and Vite. It communicates asynchronously via REST APIs with a monolithic backend powered by Java Spring Boot 3. The backend interacts with a MySQL 8 database via Spring Data JPA.

**2. Why was Vite chosen over Create React App (CRA)?**
Vite leverages native ES modules in the browser, skipping the slow bundling process during development. This results in near-instant Cold Server starts and blazing fast Hot Module Replacement (HMR) compared to Webpack-based CRA.

**3. Describe the state management strategy used in the frontend.**
We rely on React's Context API combined with standard hooks (`useState`, `useReducer`). We implemented specific contexts like `AuthContext` (managing user sessions and tokens) and `CartContext` (managing shopping cart operations) to prevent prop-drilling across the app.

**4. How does the application handle varying environment configurations (Development vs Production)?**
The React app uses `.env` files parsed by Vite (e.g., `VITE_API_BASE_URL`), while Spring Boot uses `application.properties` (or `application-dev.properties`, `application-prod.properties`) managed by Spring Profiles to define dynamic database URIs, API keys, and server ports.

**5. How is Cross-Origin Resource Sharing (CORS) handled?**
Since the React frontend runs on port `5173` and the backend on `8080`, browsers natively block XHR requests due to the Same-Origin Policy. We resolve this by adding a global `CorsConfigurationSource` Bean in Spring Security, explicitly allowing `http://localhost:5173` with allowed methods (GET, POST, PUT, DELETE, OPTIONS).

## II. React & Frontend Implementation
**6. How did you organize the frontend file structure?**
We used a feature/module-based architecture: `/components` for reusable UI elements, `/pages` for route-level containers, `/contexts` for global state, `/services` for API integrations (like Axios), and `/assets` for static media.

**7. How do you protect certain routes in React?**
We created a `ProtectedRoute` wrapper component that subscribes to the `AuthContext`. If `user` is null, it intercepts the rendering process and forces a `Navigate` to `/login`. We added an `isAdmin` check for `/admin` routes to block standard users.

**8. Explain how the Frontend intercepts and attaches JWT tokens to outgoing requests.**
We configured a global Axios instance inside `services/api.js`. We attached an Axios Request Interceptor (`api.interceptors.request.use`) that automatically reads the JWT from `localStorage` and appends it to the `Authorization: Bearer <token>` header on every single backend call.

**9. Wait, is storing JWT in localStorage secure? What are the vulnerabilities?**
Storing JWTs in localStorage is vulnerable to Cross-Site Scripting (XSS). If malicious scripts execute, they can read the token. The safer, alternative approach (though harder to implement for SPAs) is using HTTP-Only, Secure cookies which XSS attacks cannot access via `document.cookie`.

**10. How did you resolve the "Infinite Render Loop" bug in the Admin Delete Product Modal?**
The legacy code defined a nested React component (`DeleteProductModal`) inside the parent `AdminDashboard` body, and attached a `useEffect(..., [])` to fetch products. Whenever the parent updated state, React re-constructed the nested component as a brand-new function, tearing down the old one. The new one mounted, triggering the `useEffect` and database fetch again—infinitely. The fix involved hoisting the component outside or moving the `fetchProducts()` hook securely into the parent's lifecycle scope.

**11. Why did the Admin Modal headers disappear behind the top of the browser screen?**
Flexbox `align-items: center` was applied to the outer `<div className="admin-modal-overlay">`. Because the inner modal container's height mathematically exceeded the viewport constraints due to uncalculated padding box sizes (`box-sizing`), flexbox aggressively centered the oversized element, bleeding the top (where the headers lie) permanently off the visible screen. We fixed it using disciplined `flex: 1` limits, `overflow: hidden`, and moving padding explicitly to the inner bodies.

**12. How do you freeze background page scrolling when a Modal opens in React?**
We used a `useEffect` hook listening to the `activeModal` state. When a modal mounts, it captures `document.body.style.overflow` and sets it to `'hidden'`. A cleanup function `return () => { document.body.style.overflow = original; }` guarantees the scrollbar is restored when unmounted.

**13. What is the benefit of the Context API over Redux for MobileMart?**
MobileMart’s global state is largely constrained to Authentication and Shopping Cart logic. Redux introduces heavy boilerplate (store, reducers, actions, dispatchers). Context API built into React is lightweight and perfectly sufficient for this level of state complexity without bloating the bundle.

**14. Explain what responsive layout CSS techniques are used.**
We heavily utilized CSS Grid (`grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))`) and Flexbox for component alignment. Media queries (`@media max-width`) are strategically placed to transition multi-column layouts into stackable 1-column layouts for mobile viewports.

**15. How do you optimize React rendering performance?**
By structuring components to minimize unnecessary renders. Utilizing `React.memo` on heavy list items, employing `useCallback` for heavily nested event handlers, and strictly removing inline object/function declarations inside dependency arrays.

## III. Spring Boot Backend Core
**16. Explaining Dependency Injection (DI) and how Spring utilizes it.**
DI is a design pattern where objects are passed their dependencies rather than constructing them directly (Inversion of Control). Spring achieves this via its IoC Container. Spring dynamically wires dependencies annotated with `@Autowired` via Constructor, Setter, or Field Injection.

**17. Why is Constructor Injection preferred over Field Injection in Spring?**
Constructor injection enforces immutability (`final` fields) and structurally alerts you to circular dependencies during context initialization. It also makes the class testable without requiring the Spring runtime (you can just manually pass mock objects into the constructor).

**18. Describe the role of `@RestController` vs `@Controller`.**
`@Controller` returns View names (like JSP or Thymeleaf templates). `@RestController` is a combination of `@Controller` and `@ResponseBody`, signifying that the return types of its mapping methods should be automatically serialized into HTTP Response Bodies (usually JSON) via Jackson.

**19. How did you structure the MobileMart backend?**
We used N-Tier architecture:
- **Controllers (`/controller`)**: Handles HTTP requests, validations, and routes logic.
- **Services (`/service`)**: Encapsulates core business rules (e.g., Cart logic, Authentication).
- **Repositories (`/repository`)**: JPA Interfaces for raw database access.
- **Models (`/model`)**: JPA Entity classes representing database tables.

**20. What is `@Transactional` and when is it used?**
It dictates that a method should be wrapped within an ACID database transaction context. If an exception occurs, the transaction rolls back gracefully. We use it on operations like "Checkout Order" where multiple tables (Cart, Order, OrderItems, Product Stock) must be modified concurrently—if one fails, none should commit.

**21. Explain the `@Data` annotation.**
It is a Lombok annotation that auto-generates Boilerplate code at compile-time: Getters, Setters, `toString()`, `equals()`, `hashCode()`, and `RequiredArgsConstructor`. It drastically cleans up Entity classes.

**22. How are custom application exceptions handled globally?**
We implement a class annotated with `@ControllerAdvice` containing methods marked with `@ExceptionHandler`. If a controller throws a `ResourceNotFoundException`, the advice intercepts it and converts it into a standardized JSON response containing a timestamp, message, and `404` HTTP Code.

**23. How does Spring Boot auto-configuration work?**
Spring Boot utilizes `@EnableAutoConfiguration` which parses classes found in the classpath and automatically registers beans using `META-INF/spring.factories` based on conditions (like `@ConditionalOnClass`). If it sees `spring-boot-starter-web`, it automatically configures Tomcat and DispatcherServlet.

**24. How is the mobile OTP generated?**
We use Java's `SecureRandom` cryptographically secure pseudorandom number generator to generate a 6-digit string, mapping it directly over a verified `JavaMailSender` SMTP instance secured via a Google App Password.

**25. Why did you use `JavaMailSender` instead of standard JavaMail API?**
`JavaMailSender` is a powerful Spring abstraction that translates dense `MessagingExceptions` into simplified `MailExceptions` and wires smoothly into standard Spring Configuration attributes in `application.properties`.

## IV. Spring Security & JWT
**26. How do you implement Role-Based Access Control in Spring?**
We assign granted authorities (`ROLE_ADMIN`, `ROLE_CUSTOMER`) during authentication. Then, in `SecurityFilterChain`, we append `.requestMatchers("/api/admin/**").hasRole("ADMIN")`. Spring strictly intercepts unprivileged requests emitting a `403 Forbidden`.

**27. What is a JWT and how is its architecture defined?**
JSON Web Token is composed of Header, Payload, and Signature separated by dots (`.`). The payload contains claims (like email, roles, expiration). The signature is cryptographically mapped using an HMAC SHA-256 Secret Key known only to the backend.

**28. Why is JWT considered "Stateless"?**
Because the server does not need to store active sessions in a database or memory array. The token mathematically validates itself. If the signature decrypts using the backend’s secret key, the claims within it are mathematically proven to be authentic and untampered.

**29. How does `JwtAuthenticationFilter` operate in the Spring filter chain?**
Our custom filter inherits from `OncePerRequestFilter`. It reads the `Authorization: Bearer` header. If valid, it extracts the username, hits `UserDetailsService` to resolve the user, generates a `UsernamePasswordAuthenticationToken`, places it in `SecurityContextHolder`, and allows the filter chain to `doFilter()`.

**30. What happens if a JWT token is compromised?**
Since JWT is stateless, invalidating it is difficult. Best practices involve assigning short expiration times (e.g., 15 minutes) and using rotating opaque Refresh Tokens. We also ensure tokens are only transmitted over TLS (HTTPS) connections.

**31. Explain what `PasswordEncoder` accomplishes.**
We use `BCryptPasswordEncoder`. It applies a one-way mathematical hash using bcrypt. Passwords are never saved in plain text. When logging in, `bcrypt.matches()` securely verifies if the submitted raw string matches the stored encrypted hash despite varying "salts".

**32. What was the purpose of the `DataSeeder` module on application startup?**
The `DataSeeder` (`CommandLineRunner`) listens for application initialization and securely constructs our superuser credentials (`admin@mobilemart.com`) with `ROLE_ADMIN` if it doesn't already exist in the database, establishing an eternal bridge to backend configurations.

**33. How does Spring detect an unauthenticated user hitting a protected endpoint?**
The `.anyRequest().authenticated()` rule forces Spring’s `AnonymousAuthenticationFilter` to reject empty security contexts, tossing an `AuthenticationException`.

**34. Why shouldn’t sensitive user data be stored in a JWT payload?**
Because the JWT Header and Payload are encoded in Base64 (not encrypted). Anyone can intercept the token, use a tool like `jwt.io`, and instantly decode the data inside in plain English. We store only user ID, email, and Role scope.

**35. What is the fundamental difference between Authentication and Authorization?**
Authentication is determining *who* you are (Login/Passwords). Authorization is determining *what* you can do (Checking if you possess `ROLE_ADMIN` for a specific route).

## V. Database & JPA/Hibernate
**36. Explain the `@Entity` and `@Table` mappings used in MobileMart.**
`@Entity` marks a Java POJO as a persistence mapping object for JPA. `@Table` optionally strictly specifies exact database nomenclature (e.g., `@Table(name = "order_items")`). 

**37. How did you handle relationships between User and Cart?**
We utilized a `@OneToOne` mapping. When a new user registers, an event automatically ties a single permanent `Cart` entity directly mapping to them via `user_id` Foreign Keys.

**38. What is the difference between `FetchType.LAZY` and `FetchType.EAGER`?**
`LAZY` delays fetching nested relations (like Order Items for an Order) until specifically requested (getter call), preserving massive system resources. `EAGER` joins and loads everything instantly. Our Cart Items are fetched `EAGER`ly to prevent `LazyInitializationException` inside controllers without `@Transactional`.

**39. How do JPA Repositories automate SQL querying?**
The `JpaRepository` interface leverages Spring Data JPA standardizations. Functions designated as `findByUsername(String username)` are syntactically parsed into executing explicit `SELECT * FROM users WHERE username = ?` dynamically at runtime.

**40. What is a Foreign Key Constrain Violation error?**
When trying to delete a Parent object (e.g., a User), if a Child entity (e.g., Address or Order) holds a foreign key tied to that User ID without explicit `CascadeType.REMOVE`, the MySQL database violently rejects the deletion to assert structural integrity.

**41. What is the N+1 Query Problem in ORM mappings?**
When calling a `findAll()` query for 50 Orders, Hibernate might make 1 query for Orders, then 50 individual queries grabbing the Order Items matching each unique ID. It is highly anti-performant and resolved via JPQL `@Query` with `JOIN FETCH`.

**42. How does `@GeneratedValue(strategy = GenerationType.IDENTITY)` work?**
It explicitly delegates the ID constraint increment management fully to the underlying MySQL database's auto-increment system, guaranteeing highly atomic, non-collision sequential generation.

**43. What is the distinction between CrudRepository and JpaRepository?**
`JpaRepository` directly extends `CrudRepository` and `PagingAndSortingRepository`. However, it explicitly introduces JPA-specific APIs, like flushing limits, block deletes by iterable, and Pagination implementations natively.

**44. What purpose does updating the database `ddl-auto` setting to `update` serve?**
It commands Hibernate to aggressively analyze the schema inside MySQL and dynamically push new columns, alter types, and generate relational tables based on the backend Java entities automatically without dropping existing data.

**45. How did MobileMart secure database passwords?**
They are heavily abstracted into `.properties`/environment variables. Never hardcoded directly onto repositories or configurational setup files exposed via Git Repositories.

## VI. Debugging & Real-World Fixes
**46. How did we diagnose and resolve the fatal `NonUniqueResultException` backend crash?**
The JWT Login filter threw this Hibernate error. Upon inspection, legacy database registrations contained duplicate `admin@mobilemart.com` records. JPA `findByEmail` mathematically expects precisely one result. By renaming all repository endpoints across *all* domains (User, Auth, Cart, Order) to `findFirstByEmail`/`findFirstByUsername`, JPA correctly terminated queries upon finding the first valid object, gracefully preventing application crashes without massive data wiping.

**47. What causes a `StackOverflowError` when Serializing JPA Objects?**
Implementing `@ManyToMany` or `@OneToMany` frequently generates bi-directional mappings (e.g., Cart holds Items, Items reference back to parent Cart). When Jackson attempts to process JSON mapping upon `api.get()`, it bounces infinitely between Parent and Child. The solution involves assigning `@JsonIgnore` precisely against the child-facing relational mappings.

**48. Why does the console sometimes display a `CORS Preflight Failed` mechanism?**
Since frontend and backend operate on separate URL ports, complex actions utilizing Authentication headers require browser confirmation of backend acceptance boundaries. We debugged and resolved this by securely binding `OPTIONS` requests as explicitly permitted across the global `WebSecurity` firewall intercept.

**49. How can you effectively verify Backend structural integrity after massive refactors?**
Since raw UI clicking is extremely slow, we heavily utilized external programmatic API verification strategies like Postman workspaces or Node.js (`test_api.js`) to violently iterate and simulate thousands of sequential database commits bypassing front-end validation limits.

**50. What is the value of utilizing explicit UI State Trackers rather than direct DOM mutations?**
By heavily relying on `const [loading, setLoading] = useState(false)` mapped implicitly into React buttons (displaying Spinners and adding `disabled` tags), we prevent users from physically double-clicking checkout APIs triggering concurrent duplicate network payloads against our backend. React implicitly creates a deterministic state boundary.
