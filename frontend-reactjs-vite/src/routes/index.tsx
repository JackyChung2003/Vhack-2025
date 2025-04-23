import RecurringDonations from "../modules/client/common/charity/AutoDonation";

<Route path="/charity/:id" element={<CharityDetails />} />
<Route path="/charity/organization/:id" element={<Organization />} />
<Route path="/donor/recurring-donations" element={<RecurringDonations />} /> 