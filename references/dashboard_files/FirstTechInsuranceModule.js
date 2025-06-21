$(document).ready(function () {
    $(".modal").on('show.bs.modal', function () {
        $('#idForBackgroundGrayed').show();

    });
    $('.modal').on('hide.bs.modal', function () {
        $('#idForBackgroundGrayed').hide();
    });
});

function ShowInsurancePolicyDetails(policyType, policyNumber) {
    $("#insuranceDetailsModal .modal-header #insuranceDetailModalHeader").empty();
    $("#insuranceDetailsModal .modal-body #insuranceDetailProviderName").empty();
    $("#insuranceDetailsModal .modal-body #insuranceDetailExpirationDate").empty();
    $("#insuranceDetailsModal .modal-body #insuranceDetailEffectiveDate").empty();
    $("#insuranceDetailsModal .modal-body #insuranceDetailPremiumAmount").empty();
    $("#insuranceDetailsModal .modal-body #insuranceDetailPolicyNumber").empty();
    $("#insuranceDetailsModal .modal-body #insuranceDetailPolicyNumber").html(policyNumber);
    $.ajax({
        type: "POST",
        url: "/FirstTechInsurance/GetPolicyDetails",
        dataType: "json",
        cache: false,
        data: {
            'policyType': policyType,
            'policyNumber': policyNumber
        },
        success: function (response) {
            $('#idForBackgroundGrayed').hide();
            if (response.PolicyDisplayName != null || response.PolicyDisplayName != 0) {
                $("#insuranceDetailsModal .modal-header #insuranceDetailModalHeader").text(response.PolicyDisplayName + ' Insurance');
            }
            if (response.InsuranceCompany != null || response.InsuranceCompany != 0) {
                $("#insuranceDetailsModal .modal-body #insuranceDetailProviderName").text(response.InsuranceCompany);
            }
            if (response.ExpirationDate != null || response.ExpirationDate != 0) {
                $("#insuranceDetailsModal .modal-body #insuranceDetailExpirationDate").text(response.ExpirationDate);
            }
            if (response.EffectiveDate != null || response.EffectiveDate != 0) {
                $("#insuranceDetailsModal .modal-body #insuranceDetailEffectiveDate").text(response.EffectiveDate);
            }
            if (response.PremiumAmount != null || response.PremiumAmount != 0) {
                $("#insuranceDetailsModal .modal-body #insuranceDetailPremiumAmount").text('$ ' + parseFloat(response.PremiumAmount).toFixed(2));
            }
            $("#insuranceDetailsModal").modal();
        },
        error: function () {
            $('#idForBackgroundGrayed').hide();
        },
        always : function () {
            $('#idForBackgroundGrayed').hide();           
        }
    });
}

function naviageToDesktopPolicyView() {
    $('.policyNumber').val($('#insuranceDetailPolicyNumber').text()); 
    $('#formInsuranceDetails').submit();
}
