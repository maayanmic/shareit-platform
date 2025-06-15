# ShareIt Platform

A QR-driven social-sharing rewards platform that connects SMBs with consumers through organic Facebook referrals.

## Project Overview

ShareIt enables businesses to generate QR codes that customers can scan to share recommendations on Facebook. Users earn coins for sharing and can redeem discounts, while businesses gain valuable analytics and organic marketing.

### Core Features

- QR code scanning and deep-linking
- Facebook OAuth2 authentication
- Social media sharing with tracking
- Digital wallet for discounts and coins

## Tech Stack

- **Frontend**: React (TypeScript)
- **Database**: Firestore (Firebase)
- **Authentication**: Firebase Auth + Facebook OAuth2
- **Storage**: Firebase Storage
- **Hosting**: Firebase Hosting

## Project Structure

```
shareit/
├── client/        # React application (main source)
├── dist/          # Build output for Firebase Hosting
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up Firebase:
   - Create a Firebase project
   - Enable Authentication, Firestore, and Hosting
   - Configure Facebook OAuth2
4. Set up environment variables
5. Start development:
   ```bash
   npm run dev
   ```

## Development Phases

1. **Phase 1** (March 30 – April 19): Project setup and authentication
2. **Phase 2** (April 20 – May 10): Core sharing and referral features
3. **Phase 3** (May 11 – May 31): Redemption and analytics
4. **Phase 4** (June 1 – June 14): Admin features and finalization

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `npm test`
4. Submit a pull request

## License

MIT 
