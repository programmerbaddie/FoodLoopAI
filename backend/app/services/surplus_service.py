"""Surplus service layer for FoodLoop AI."""
from app.schemas.surplus import SurplusCategory, SurplusStatus, SurplusRecordResponse
from app.schemas.menu import MealSlot


class SurplusService:
    """Service managing post-meal surplus detection, holding conditions, and status updates."""

    def __init__(self):
        self._demo_records: list[SurplusRecordResponse] = [
            SurplusRecordResponse(
                id="SUR-0921",
                batch_id="B-LUNCH-RICE-02",
                kitchen_id="KITCHEN-IITD-01",
                meal_slot=MealSlot.LUNCH,
                dish_name="Jeera Pulao (Long Grain Basmati)",
                category=SurplusCategory.COOKED_GRAINS,
                quantity_kg=28.5,
                portions_equivalent=60,
                prep_timestamp="12:15 IST",
                holding_temp_c=66.0,
                status=SurplusStatus.VERIFIED_SAFE,
                storage_unit="Insulated Hot-Holding Cabinet #1",
                shelf_life_remaining_hours=2.2,
                is_demo_data=True,
            ),
            SurplusRecordResponse(
                id="SUR-0922",
                batch_id="B-LUNCH-DAL-01",
                kitchen_id="KITCHEN-IITD-01",
                meal_slot=MealSlot.LUNCH,
                dish_name="Yellow Dal Tadka (Arhar & Moong)",
                category=SurplusCategory.CURRY_DAL,
                quantity_kg=19.0,
                portions_equivalent=45,
                prep_timestamp="12:30 IST",
                holding_temp_c=64.0,
                status=SurplusStatus.VERIFIED_SAFE,
                storage_unit="Insulated Hot-Holding Cabinet #2",
                shelf_life_remaining_hours=2.5,
                is_demo_data=True,
            ),
            SurplusRecordResponse(
                id="SUR-0923",
                batch_id="B-LUNCH-ROTI-03",
                kitchen_id="KITCHEN-IITD-01",
                meal_slot=MealSlot.LUNCH,
                dish_name="Whole Wheat Tawa Rotis (Packed in foil)",
                category=SurplusCategory.BREADS_ROTIS,
                quantity_kg=12.0,
                portions_equivalent=50,
                prep_timestamp="13:00 IST",
                holding_temp_c=58.0,
                status=SurplusStatus.PENDING_VERIFICATION,
                storage_unit="Thermal Insulation Crate #4",
                shelf_life_remaining_hours=1.8,
                is_demo_data=True,
            ),
            SurplusRecordResponse(
                id="SUR-0924",
                batch_id="B-LUNCH-SABZI-01",
                kitchen_id="KITCHEN-IITD-01",
                meal_slot=MealSlot.LUNCH,
                dish_name="Aloo Gobi Matar Curry",
                category=SurplusCategory.VEGETABLES,
                quantity_kg=15.5,
                portions_equivalent=35,
                prep_timestamp="12:20 IST",
                holding_temp_c=63.0,
                status=SurplusStatus.MATCHED,
                storage_unit="Stainless Steel Insulated Container #3",
                shelf_life_remaining_hours=2.1,
                is_demo_data=True,
            ),
            SurplusRecordResponse(
                id="SUR-0925",
                batch_id="B-BKFST-IDLI-01",
                kitchen_id="KITCHEN-IITD-01",
                meal_slot=MealSlot.BREAKFAST,
                dish_name="Steamed Semolina Idlis",
                category=SurplusCategory.COOKED_GRAINS,
                quantity_kg=10.0,
                portions_equivalent=30,
                prep_timestamp="08:45 IST",
                holding_temp_c=61.0,
                status=SurplusStatus.DISPATCHED,
                storage_unit="Handoff Crate #2",
                shelf_life_remaining_hours=0.5,
                is_demo_data=True,
            ),
        ]

    def get_all_surplus(
        self,
        kitchen_id: str | None = None,
        category: SurplusCategory | None = None,
        status: SurplusStatus | None = None,
    ) -> list[SurplusRecordResponse]:
        """Query surplus records with optional category and status filtering."""
        results = self._demo_records
        if kitchen_id:
            results = [r for r in results if r.kitchen_id == kitchen_id]
        if category:
            results = [r for r in results if r.category == category]
        if status:
            results = [r for r in results if r.status == status]
        return results

    def get_surplus_by_id(self, surplus_id: str) -> SurplusRecordResponse | None:
        """Find a single surplus item by unique identifier."""
        for r in self._demo_records:
            if r.id == surplus_id:
                return r
        return None

    def update_status(self, surplus_id: str, new_status: SurplusStatus) -> SurplusRecordResponse | None:
        """Update operational status for a surplus batch."""
        for r in self._demo_records:
            if r.id == surplus_id:
                r.status = new_status
                return r
        return None


surplus_service = SurplusService()
